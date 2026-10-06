// Iconos Sol: chevrons pixelados y Nucleo UI Essential (outline 18). Decorativos: el texto o el
// aria-label del control que los contiene da el nombre.
import type { ComponentType } from 'react';
import {
  IconBookOpenOutline18,
  IconCalendarOutline18,
  IconCheckOutline18,
  IconCircleCompose2Outline18,
  IconCircleInfoOutline18,
  IconClipboardOutline18,
  IconCreditCardOutline18,
  IconFileContentOutline18,
  IconInboxArrowDownOutline18,
  IconLinkOutline18,
  IconLocation2Outline18,
  IconLockOutline18,
  IconMagnifierOutline18,
  IconMsgsOutline18,
  IconPhoneOutline18,
  IconRefresh2Outline18,
  IconShieldCheckOutline18,
  IconThumbsUpOutline18,
  IconTriangleWarningOutline18,
  IconUserOutline18,
  IconXmarkOutline18,
} from 'nucleo-ui-essential-outline-18';

type Svg = ComponentType<{ size?: number; className?: string; 'aria-hidden'?: true }>;

// Nucleo UI no trae «detener»: cuadrado redondeado propio sobre la misma rejilla de 18.
function Detener({ size, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" className={className} aria-hidden="true">
      <rect x="4.5" y="4.5" width="9" height="9" rx="2" fill="currentColor" />
    </svg>
  );
}

const iconos = {
  detener: Detener,
  descargar: IconInboxArrowDownOutline18,
  externo: IconLinkOutline18,
  copiar: IconClipboardOutline18,
  util: IconThumbsUpOutline18,
  noUtil: IconThumbsUpOutline18,
  reintentar: IconRefresh2Outline18,
  nueva: IconCircleCompose2Outline18,
  cerrar: IconXmarkOutline18,
  buscar: IconMagnifierOutline18,
  fuentes: IconBookOpenOutline18,
  contacto: IconMsgsOutline18,
  protegido: IconShieldCheckOutline18,
  info: IconCircleInfoOutline18,
  error: IconTriangleWarningOutline18,
  nunca: IconXmarkOutline18,
  hecho: IconCheckOutline18,
  candado: IconLockOutline18,
  calendario: IconCalendarOutline18,
  documento: IconFileContentOutline18,
  ubicacion: IconLocation2Outline18,
  usuario: IconUserOutline18,
  tarjeta: IconCreditCardOutline18,
  telefono: IconPhoneOutline18,
} satisfies Record<string, Svg>;

export type NombreIcono = keyof typeof iconos | 'enviar' | 'abajo' | 'derecha';

export function Icono({ n, size = 18 }: { n: NombreIcono; size?: number }) {
  if (n === 'enviar' || n === 'abajo' || n === 'derecha') {
    return (
      <svg
        className="icono"
        width={size}
        height={size}
        viewBox="0 0 16 16"
        fill="currentColor"
        shapeRendering="crispEdges"
        aria-hidden="true"
      >
        <path
          transform={`rotate(${n === 'abajo' ? 90 : n === 'enviar' ? -90 : 0} 8 8)`}
          d="M4 0h3v3H4zM7 3h3v3H7zM10 6h3v3h-3zM7 9h3v3H7zM4 12h3v3H4z"
        />
      </svg>
    );
  }
  const Componente: Svg = iconos[n];
  // «No útil» es el pulgar de «útil» girado: Nucleo UI no trae pulgar abajo.
  const clase = n === 'noUtil' ? 'icono icono-girado' : 'icono';
  return <Componente size={size} className={clase} aria-hidden />;
}
