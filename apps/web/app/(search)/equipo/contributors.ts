import { z } from 'zod';
import { links } from '../../../lib/site';

const contributorsSchema = z.array(
  z.object({
    id: z.number().int().positive(),
    login: z.string().min(1).max(100),
    type: z.string(),
  }),
);

export async function getContributors() {
  try {
    // Hasta 100 perfiles en esta vista; el enlace a GitHub permite consultar la lista completa.
    const response = await fetch(
      `https://api.github.com/repos${new URL(links.repo).pathname}/contributors?per_page=100`,
      {
        headers: { Accept: 'application/vnd.github+json' },
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(5000),
      },
    );
    if (!response.ok) return null;
    if (response.status === 204) return [];
    return contributorsSchema.parse(await response.json()).filter(({ type }) => type === 'User');
  } catch {
    return null;
  }
}
