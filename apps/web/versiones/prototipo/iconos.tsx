'use client';

// Iconos del prototipo: Feather (Lucide) frente a Nucleo UI, la familia elegida.
// Si una familia no tiene equivalente, se usa Feather y el panel lo indica.
import { createContext, useContext, type ComponentType } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  EyeOff,
  Info,
  Menu,
  MessageCircle,
  Paperclip,
  PencilLine,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  Square,
  ThumbsDown,
  ThumbsUp,
  CircleAlert,
  X,
  XCircle,
} from 'lucide-react';
import {
  IconBookOpenOutline18,
  IconCheckOutline18,
  IconChevronDownOutline18,
  IconChevronLeftOutline18,
  IconChevronRightOutline18,
  IconCircleCompose2Outline18,
  IconCircleInfoOutline18,
  IconClipboardOutline18,
  IconEyeClosedOutline18,
  IconInboxArrowDownOutline18,
  IconLinkOutline18,
  IconMagnifierOutline18,
  IconMsgsOutline18,
  IconPaperPlane2Outline18,
  IconPaperclipOutline18,
  IconPen3Outline18,
  IconRefresh2Outline18,
  IconShieldCheckOutline18,
  IconThumbsUpOutline18,
  IconTriangleWarningOutline18,
  IconXmarkOutline18,
} from 'nucleo-ui-essential-outline-18';

export type Nombre =
  | 'enviar'
  | 'detener'
  | 'adjuntar'
  | 'descargar'
  | 'externo'
  | 'copiar'
  | 'util'
  | 'noUtil'
  | 'reintentar'
  | 'reformular'
  | 'nueva'
  | 'menu'
  | 'cerrar'
  | 'atras'
  | 'adelante'
  | 'abajo'
  | 'buscar'
  | 'fuentes'
  | 'contacto'
  | 'protegido'
  | 'oculto'
  | 'info'
  | 'error'
  | 'nunca'
  | 'hecho'
  | 'izquierda'
  | 'derecha';

type C = ComponentType<{ size?: number | string; className?: string }>;

const feather: Record<Nombre, C> = {
  enviar: ArrowUp,
  detener: Square,
  adjuntar: Paperclip,
  descargar: Download,
  externo: ArrowUpRight,
  copiar: Copy,
  util: ThumbsUp,
  noUtil: ThumbsDown,
  reintentar: RotateCcw,
  reformular: PencilLine,
  nueva: Plus,
  menu: Menu,
  cerrar: X,
  atras: ChevronLeft,
  adelante: ChevronRight,
  abajo: ArrowDown,
  buscar: Search,
  fuentes: BookOpen,
  contacto: MessageCircle,
  protegido: ShieldCheck,
  oculto: EyeOff,
  info: Info,
  error: CircleAlert,
  nunca: XCircle,
  hecho: Check,
  izquierda: ArrowLeft,
  derecha: ArrowRight,
};

export const familias = {
  feather: { nombre: 'Feather', iconos: feather },
  ui: {
    nombre: 'Nucleo UI',
    iconos: {
      enviar: IconPaperPlane2Outline18,
      adjuntar: IconPaperclipOutline18,
      descargar: IconInboxArrowDownOutline18,
      externo: IconLinkOutline18,
      copiar: IconClipboardOutline18,
      util: IconThumbsUpOutline18,
      noUtil: IconThumbsUpOutline18,
      reintentar: IconRefresh2Outline18,
      reformular: IconPen3Outline18,
      nueva: IconCircleCompose2Outline18,
      cerrar: IconXmarkOutline18,
      atras: IconChevronLeftOutline18,
      adelante: IconChevronRightOutline18,
      abajo: IconChevronDownOutline18,
      buscar: IconMagnifierOutline18,
      fuentes: IconBookOpenOutline18,
      contacto: IconMsgsOutline18,
      protegido: IconShieldCheckOutline18,
      oculto: IconEyeClosedOutline18,
      info: IconCircleInfoOutline18,
      error: IconTriangleWarningOutline18,
      hecho: IconCheckOutline18,
      izquierda: IconChevronLeftOutline18,
      derecha: IconChevronRightOutline18,
    } as Partial<Record<Nombre, C>>,
  },
};

export type Familia = keyof typeof familias;
export const FamiliaContext = createContext<Familia>('ui');

export function faltan(familia: Familia) {
  const propios = familias[familia].iconos as Partial<Record<Nombre, C>>;
  return (Object.keys(feather) as Nombre[]).filter((n) => !propios[n]);
}

export function Icono({ n, size = 18 }: { n: Nombre; size?: number }) {
  const familia = useContext(FamiliaContext);
  const propio = (familias[familia].iconos as Partial<Record<Nombre, C>>)[n];
  const Componente = propio ?? feather[n];
  // Nucleo no trae «pulgar abajo»: se gira el de arriba.
  const girar = n === 'noUtil' && familia !== 'feather' && !!propio;
  return (
    <Componente
      size={size}
      className={girar ? 'pr-icono pr-icono-girado' : 'pr-icono'}
      aria-hidden="true"
    />
  );
}
