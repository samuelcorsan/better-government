import type { ComponentPropsWithRef } from 'react';

/**
 * Componentes React de Sol (GUIA.md). Solo ponen las clases de botones.css y campos.css; el
 * resto de props y la ref van al elemento nativo.
 */

const variants = {
  primary: 'boton',
  secondary: 'boton-claro',
  ghost: 'boton-fantasma',
  icon: 'boton-icono',
  send: 'boton-enviar',
} as const;

const join = (base: string, extra: string | undefined) => (extra ? `${base} ${extra}` : base);

/** Con `href` es un `<a>` (navegar); sin él, un `<button>` (actuar). */
type ButtonProps = (
  | (ComponentPropsWithRef<'button'> & { href?: never })
  | (ComponentPropsWithRef<'a'> & { href: string })
) &
  (
    | { variant?: 'primary' | 'secondary' | 'ghost' }
    | { variant: 'icon' | 'send'; 'aria-label': string }
  );

export function Button({ variant = 'primary', className, ...props }: ButtonProps) {
  const classes = join(variants[variant], className);
  return props.href === undefined ? (
    <button className={classes} {...props} />
  ) : (
    <a className={classes} {...props} />
  );
}

export function Field({ className, ...props }: ComponentPropsWithRef<'input'>) {
  return <input className={join('campo', className)} {...props} />;
}
