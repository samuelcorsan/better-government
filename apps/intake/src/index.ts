/**
 * Stateless report intake.
 *
 * Deploy as a Cloudflare Worker (or compatible). Secrets (GitHub App private key)
 * live only here — never in the Chrome extension package.
 *
 * Environment bindings expected:
 * - GITHUB_APP_ID, GITHUB_INSTALLATION_ID, GITHUB_APP_PRIVATE_KEY
 * - GITHUB_PRIVATE_REPO ("owner/name" of the private inbox repo)
 * - Optional: RATE_LIMIT_KV (KV namespace) for IP/fingerprint quotas
 */

import { type PageSnapshot } from '@reforma-digital/capture';
import { processReport } from './process';

export { processReport } from './process';

const MAX_BYTES = 3 * 1024 * 1024;
const DAILY_IP_LIMIT = 20;
const DAILY_FP_LIMIT = 5;

export interface IntakeEnv {
  GITHUB_APP_ID: string;
  GITHUB_INSTALLATION_ID: string;
  GITHUB_APP_PRIVATE_KEY: string;
  GITHUB_PRIVATE_REPO: string;
  RATE_LIMIT_KV?: {
    get(key: string): Promise<string | null>;
    put(key: string, value: string, opts?: { expirationTtl?: number }): Promise<void>;
  };
}

type JsonResponse = { status: number; body: unknown };

function json(status: number, body: unknown): JsonResponse {
  return { status, body };
}

function corsHeaders(request: Request): HeadersInit {
  const origin = request.headers.get('Origin') ?? '';
  // Extension pages use chrome-extension://<id>. Reflect only that scheme.
  const allow =
    origin.startsWith('chrome-extension://') || origin.startsWith('http://127.0.0.1:')
      ? origin
      : '';
  return {
    'content-type': 'application/json; charset=utf-8',
    ...(allow
      ? {
          'access-control-allow-origin': allow,
          'access-control-allow-methods': 'POST, OPTIONS',
          'access-control-allow-headers': 'content-type',
          vary: 'Origin',
        }
      : {}),
  };
}

async function rateLimit(env: IntakeEnv, ip: string, fingerprint: string): Promise<string | null> {
  if (!env.RATE_LIMIT_KV) return null;
  const day = new Date().toISOString().slice(0, 10);
  const ipKey = `ip:${day}:${ip || 'unknown'}`;
  const fpKey = `fp:${day}:${fingerprint}`;
  const ipCount = Number((await env.RATE_LIMIT_KV.get(ipKey)) ?? '0');
  const fpCount = Number((await env.RATE_LIMIT_KV.get(fpKey)) ?? '0');
  if (ipCount >= DAILY_IP_LIMIT) return 'Rate limit (IP)';
  if (fpCount >= DAILY_FP_LIMIT) return 'Rate limit (fingerprint)';
  await env.RATE_LIMIT_KV.put(ipKey, String(ipCount + 1), { expirationTtl: 172800 });
  await env.RATE_LIMIT_KV.put(fpKey, String(fpCount + 1), { expirationTtl: 172800 });
  return null;
}

async function githubAppToken(env: IntakeEnv): Promise<string> {
  // Minimal JWT for GitHub App installation tokens. The private key is PEM in the secret.
  const now = Math.floor(Date.now() / 1000);
  const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
    .replace(/=+$/, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  const payload = btoa(JSON.stringify({ iat: now - 60, exp: now + 600, iss: env.GITHUB_APP_ID }))
    .replace(/=+$/, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  const data = `${header}.${payload}`;
  const key = await crypto.subtle.importKey(
    'pkcs8',
    pemToArrayBuffer(env.GITHUB_APP_PRIVATE_KEY),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    new TextEncoder().encode(data),
  );
  const sig = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=+$/, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  const jwt = `${data}.${sig}`;
  const tokenRes = await fetch(
    `https://api.github.com/app/installations/${env.GITHUB_INSTALLATION_ID}/access_tokens`,
    {
      method: 'POST',
      headers: {
        authorization: `Bearer ${jwt}`,
        accept: 'application/vnd.github+json',
        'user-agent': 'reforma-digital-intake',
      },
    },
  );
  if (!tokenRes.ok) throw new Error(`GitHub app token failed: ${tokenRes.status}`);
  const body = (await tokenRes.json()) as { token: string };
  return body.token;
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const b64 = pem
    .replace(/-----BEGIN [^-]+-----/, '')
    .replace(/-----END [^-]+-----/, '')
    .replace(/\s+/g, '');
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

async function storeInPrivateRepo(
  env: IntakeEnv,
  snapshot: PageSnapshot,
  parts: { siteId: string; fingerprint: string },
): Promise<{ created: boolean; issueUrl?: string }> {
  const token = await githubAppToken(env);
  const [owner, repo] = env.GITHUB_PRIVATE_REPO.split('/');
  if (!owner || !repo) throw new Error('GITHUB_PRIVATE_REPO must be owner/name');
  const base = `https://api.github.com/repos/${owner}/${repo}`;
  const dir = `inbox/${parts.siteId}/${parts.fingerprint}`;
  const headers = {
    authorization: `Bearer ${token}`,
    accept: 'application/vnd.github+json',
    'user-agent': 'reforma-digital-intake',
    'content-type': 'application/json',
  };

  // Dedup: look for an open issue with this fingerprint label/title marker.
  const search = await fetch(`${base}/issues?state=open&labels=pagina-pendiente&per_page=100`, {
    headers,
  });
  if (search.ok) {
    const issues = (await search.json()) as { title: string; html_url: string; body?: string }[];
    const existing = issues.find(
      (issue) =>
        issue.title.includes(parts.fingerprint.slice(0, 12)) ||
        (issue.body ?? '').includes(parts.fingerprint),
    );
    if (existing) return { created: false, issueUrl: existing.html_url };
  }

  const meta = {
    siteId: snapshot.siteId,
    url: snapshot.url,
    fingerprint: snapshot.fingerprint,
    reason: snapshot.reason,
    extensionVersion: snapshot.extensionVersion,
    counts: snapshot.counts,
    cssUnavailable: snapshot.cssUnavailable,
  };

  for (const [name, content] of [
    ['page.html', snapshot.html],
    ['page.css', snapshot.css],
    ['meta.json', JSON.stringify(meta, null, 2) + '\n'],
  ] as const) {
    const put = await fetch(`${base}/contents/${dir}/${name}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        message: `inbox: ${parts.siteId} ${parts.fingerprint.slice(0, 8)}`,
        content: btoa(unescape(encodeURIComponent(content))),
      }),
    });
    if (!put.ok && put.status !== 422) {
      // 422 often means file exists — treat as dedup
      const text = await put.text();
      if (put.status !== 409)
        throw new Error(`GitHub contents failed: ${put.status} ${text.slice(0, 200)}`);
    }
  }

  const issue = await fetch(`${base}/issues`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      title: `Página pendiente: ${snapshot.siteId} ${snapshot.url} (${parts.fingerprint.slice(0, 12)})`,
      labels: ['pagina-pendiente'],
      body: [
        `Portal: \`${snapshot.siteId}\``,
        `URL: \`${snapshot.url}\``,
        `Huella: \`${snapshot.fingerprint}\``,
        `Motivo: \`${snapshot.reason}\``,
        `Extensión: \`${snapshot.extensionVersion}\``,
        '',
        `Archivos: \`${dir}/\` (page.html, page.css, meta.json)`,
        '',
        'Añade la etiqueta `captura-revisada` tras revisar el HTML censurado para abrir la PR draft en el repositorio público.',
      ].join('\n'),
    }),
  });
  if (!issue.ok) throw new Error(`GitHub issue failed: ${issue.status}`);
  const created = (await issue.json()) as { html_url: string };
  return { created: true, issueUrl: created.html_url };
}

/** Worker fetch handler. */
export default {
  async fetch(request: Request, env: IntakeEnv): Promise<Response> {
    const headers = corsHeaders(request);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers,
      });
    }
    const url = new URL(request.url);
    if (url.pathname !== '/v1/reports') {
      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers });
    }

    const length = Number(request.headers.get('content-length') ?? '0');
    if (length > MAX_BYTES) {
      return new Response(JSON.stringify({ error: 'Payload too large' }), {
        status: 413,
        headers,
      });
    }

    let raw: unknown;
    try {
      const text = await request.text();
      if (text.length > MAX_BYTES) {
        return new Response(JSON.stringify({ error: 'Payload too large' }), {
          status: 413,
          headers,
        });
      }
      raw = JSON.parse(text);
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers });
    }

    const processed = await processReport(raw);
    if (!processed.ok) {
      return new Response(JSON.stringify({ error: processed.error }), {
        status: processed.status,
        headers,
      });
    }

    const ip =
      request.headers.get('cf-connecting-ip') ?? request.headers.get('x-forwarded-for') ?? '';
    const limited = await rateLimit(env, ip, processed.parts.fingerprint);
    if (limited) {
      return new Response(JSON.stringify({ error: limited }), { status: 429, headers });
    }

    try {
      const stored = await storeInPrivateRepo(env, processed.snapshot, processed.parts);
      return new Response(
        JSON.stringify({
          ok: true,
          created: stored.created,
          issueUrl: stored.issueUrl,
        }),
        { status: stored.created ? 201 : 200, headers },
      );
    } catch (error) {
      // Never log the report body.
      console.error('intake store failed', error instanceof Error ? error.message : 'unknown');
      return new Response(JSON.stringify({ error: 'Store failed' }), { status: 502, headers });
    }
  },
};

export { json };
