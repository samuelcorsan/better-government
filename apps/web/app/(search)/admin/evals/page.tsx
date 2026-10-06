import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { listReports, compareReports, type Report } from '@reforma-digital/evals/reports';
import { PaginaInformativa } from '../../../../components/sol/pagina-informativa';
import { authorized } from '../../../../lib/security';
import { login, logout } from './actions';
export const metadata: Metadata = {
  title: 'Evaluaciones · Reforma Digital',
  robots: { index: false, follow: false },
};
export const dynamic = 'force-dynamic';
const display = (name: string, value: number | null | undefined) =>
  value == null
    ? 'N/A'
    : name.includes('Latency')
      ? Math.round(value) + ' ms'
      : name === 'costUsd'
        ? '$' + value.toFixed(5)
        : name === 'tokens'
          ? Math.round(value).toLocaleString('es-ES')
          : (value * 100).toFixed(1) + '%';
export default async function Evals({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; baseline?: string }>;
}) {
  const auth = authorized((await cookies()).get('gov_admin')?.value ?? null);
  const params = await searchParams;
  let reports: Report[] = [];
  let storageError = false;
  if (auth)
    try {
      reports = await listReports();
    } catch {
      storageError = true;
    }
  const baseline = reports.find((r) => r.id === params.baseline) ?? reports.find((r) => r.approved);
  const latest = reports[0];
  return (
    <PaginaInformativa>
      <span className="t-etiqueta info-etiqueta">LABORATORIO DE CALIDAD</span>
      <h1>Menos intuición. Más evidencia.</h1>
      <p className="info-entradilla">
        Recuperación, respuestas y regresiones. Cada métrica, cada consulta y cada configuración,
        por separado.
      </p>
      {!auth ? (
        <div className="admin-message">
          <h2>Acceso interno</h2>
          <p>
            {process.env.ADMIN_TOKEN
              ? 'Introduce la clave del operador para consultar experimentos y sus fallos.'
              : 'Configura ADMIN_TOKEN en el servidor para habilitar el acceso. Los informes de consultas no son públicos.'}
          </p>
          {process.env.ADMIN_TOKEN && (
            <form action={login}>
              <label htmlFor="token">Clave de administrador</label>
              <input
                id="token"
                name="token"
                type="password"
                autoComplete="current-password"
                required
              />
              {params.error && <p role="alert">Clave incorrecta.</p>}
              <button className="boton" type="submit">
                Entrar
              </button>
            </form>
          )}
        </div>
      ) : (
        <>
          <form action={logout}>
            <button className="boton-fantasma">Cerrar sesión</button>
          </form>
          {storageError && (
            <p role="alert">No se ha podido acceder al almacenamiento de experimentos.</p>
          )}
          {!latest ? (
            <div className="admin-message">
              <h2>Todavía no hay experimentos</h2>
              <p>
                Ejecuta <code>pnpm eval</code> desde el repositorio. No se muestran métricas
                simuladas.
              </p>
            </div>
          ) : (
            <>
              <div>
                <span className="status-badge">
                  {latest.metadata.mode === 'preview'
                    ? 'Vista previa · no certifica producción'
                    : 'Índice conectado'}
                </span>
                <span className="status-badge">
                  {latest.metadata.reviewedCases}/{latest.metadata.totalCases} casos revisados
                </span>
                <span className="status-badge">
                  {baseline?.approved
                    ? 'Baseline aprobado'
                    : baseline
                      ? 'Comparación provisional · sin aprobar'
                      : 'Baseline de producción pendiente'}
                </span>
              </div>
              <div className="metric-grid">
                {[
                  'recall5',
                  'faithfulness',
                  'citationPrecision',
                  'wrongJurisdiction',
                  'completeness',
                  'abstentionAccuracy',
                  'p95Latency',
                  'costUsd',
                ].map((k) => (
                  <div className="metric-tile" key={k}>
                    <span>{k}</span>
                    <strong>{display(k, latest.metrics[k])}</strong>
                  </div>
                ))}
              </div>
            </>
          )}
          {reports.length > 1 && (
            <form method="get">
              <label htmlFor="baseline-run">Comparar con experimento </label>
              <select id="baseline-run" name="baseline" defaultValue={baseline?.id ?? ''}>
                <option value="">Baseline aprobado</option>
                {reports.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.metadata.datasetVersion} · {r.cases.length} casos · {r.id.slice(0, 8)}
                    {r.approved ? ' · aprobado' : ''}
                  </option>
                ))}
              </select>
              <button className="boton-fantasma" type="submit">
                Comparar
              </button>
            </form>
          )}
          {reports.map((r) => {
            let comparison: ReturnType<typeof compareReports> | null = null;
            let comparisonError = '';
            if (baseline && baseline.id !== r.id)
              try {
                comparison = compareReports(r, baseline);
              } catch (e) {
                comparisonError = e instanceof Error ? e.message : 'No comparable';
              }
            return (
              <details className="report-panel" key={r.id} open={r.id === latest?.id}>
                <summary>
                  {new Date(r.metadata.timestamp).toLocaleString('es-ES')} ·{' '}
                  {r.metadata.datasetVersion} · {r.cases.length} casos
                </summary>
                <p>
                  {r.id} · {r.metadata.model} · {r.metadata.mode} · Git {r.metadata.gitCommit}
                  {r.metadata.dirty ? ' (cambios locales)' : ''}
                </p>
                {comparisonError && <p>{comparisonError}</p>}
                {comparison && (
                  <>
                    <h3>Comparación con baseline</h3>
                    <pre>{JSON.stringify(comparison, null, 2)}</pre>
                  </>
                )}
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Métrica</th>
                        <th>Global</th>
                        {Object.keys(r.categories).map((c) => (
                          <th key={c}>{c}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(r.metrics).map(([k, v]) => (
                        <tr key={k}>
                          <td>{k}</td>
                          <td>{display(k, v)}</td>
                          {Object.values(r.categories).map((m, i) => (
                            <td key={i}>{display(k, m[k])}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <details>
                  <summary>Modelo y configuración reproducible</summary>
                  <pre>{JSON.stringify(r.metadata, null, 2)}</pre>
                </details>
                <h2>Fallos ({r.cases.filter((c) => c.failures.length).length})</h2>
                {r.cases
                  .filter((c) => c.failures.length)
                  .map((c) => (
                    <div className="failure" key={c.case.id}>
                      <span className="status-badge">
                        {c.case.id}
                        {c.case.critical ? ' · CRÍTICO' : ''}
                      </span>
                      <h3>{c.case.query}</h3>
                      <p>
                        <strong>Fallo:</strong> {c.failures.join(' · ')} {c.error}
                      </p>
                      <p>
                        <strong>Esperado:</strong> {c.case.expected.relevantSourceIds.join(', ')} ·{' '}
                        {c.case.expected.mustContainFacts.join('; ')}
                      </p>
                      <ol>
                        {c.result?.evidence.slice(0, 5).map((e) => (
                          <li key={e.chunkId}>
                            <a href={e.canonicalUrl} target="_blank" rel="noopener noreferrer">
                              {e.title}
                            </a>{' '}
                            · {e.jurisdiction}
                          </li>
                        ))}
                      </ol>
                      <details>
                        <summary>Respuesta y jueces</summary>
                        <pre>
                          {JSON.stringify({ answer: c.result?.answer, judges: c.judges }, null, 2)}
                        </pre>
                      </details>
                      <code>Trace ID: {c.result?.traceId ?? 'N/A'}</code>
                    </div>
                  ))}
              </details>
            );
          })}
        </>
      )}
    </PaginaInformativa>
  );
}
