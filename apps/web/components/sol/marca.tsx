// Logotipo: R con la esquina doblada. El cuerpo toma el color del texto; el doblez va en --doblez.
export function Marca({ size = 28 }: { size?: number }) {
  return (
    <svg width={(size * 3) / 4} height={size} viewBox="0 0 144 192" aria-hidden="true">
      <path fill="var(--marca-color, currentColor)" d="M48 0H96V48H48V96H96V144H48V192H0V48H48Z" />
      <path fill="var(--doblez, #a50e0e)" d="M0 48L48 0V48Z" />
      <rect x="96" y="48" width="48" height="48" fill="var(--marca-color, currentColor)" />
      <rect x="96" y="144" width="48" height="48" fill="var(--marca-color, currentColor)" />
    </svg>
  );
}

// Logotipo completo: la R y «Reforma / Digital» en dos líneas, Timeless Sans Bold. `size` es el alto
// de la R; el texto ocupa ese mismo alto. Toma el color del texto.
export function Logotipo({ size = 28 }: { size?: number }) {
  return (
    <span className="marca" style={{ fontSize: Math.round(size * 0.5) }}>
      <Marca size={size} />
      <span className="marca-texto">
        Reforma
        <br />
        Digital
      </span>
    </span>
  );
}
