/**
 * Aviso discreto y no bloqueante cuando un adaptador no puede aplicarse
 * (DESIGN.md §3 · Aviso de fallback). La web oficial queda como la sirve la Administración.
 */
export function FallbackNotice({
  adapterName,
  reason,
  onClose,
  variant = 'mismatch',
  pending = false,
}: {
  adapterName: string;
  reason: string;
  onClose: () => void;
  /** mismatch = DOM no encaja; unsupported = pantalla aún no adaptada. */
  variant?: 'mismatch' | 'unsupported';
  /** True when this path+fingerprint is already in the public inbox. */
  pending?: boolean;
}) {
  const title =
    variant === 'unsupported'
      ? 'Pantalla sin interfaz comunitaria'
      : 'Reforma Digital · web original';
  const body =
    variant === 'unsupported'
      ? pending
        ? `La pantalla de «${adapterName}» aún no tiene interfaz, pero ya está en la cola de trabajo.`
        : `Esta pantalla de «${adapterName}» aún no tiene interfaz comunitaria. Puedes reportarla desde el icono de Reforma Digital (sin enviar datos personales).`
      : `La mejora «${adapterName}» no es compatible con esta versión de la página, así que se muestra la web oficial sin cambios.`;
  return (
    <div
      role="status"
      className="bg-card bg-text fixed bottom-3 left-3 right-3 z-[2147483646] max-w-sm p-4 text-[14px] shadow-raised sm:right-auto"
    >
      <p className="bg-eyebrow">{title}</p>
      <p className="mt-1.5">{body}</p>
      {variant === 'mismatch' || reason ? (
        <details className="bg-small mt-2">
          <summary className="cursor-pointer">Detalle técnico</summary>
          <p className="mt-1 break-words">{reason}</p>
        </details>
      ) : null}
      <button type="button" onClick={onClose} className="bg-btn bg-btn-secondary mt-3">
        Cerrar aviso
      </button>
    </div>
  );
}
