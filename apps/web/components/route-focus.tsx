'use client';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

/** Next no mueve el foco al navegar; si el enlace pulsado desaparece, el foco pasa al <main>. */
export function RouteFocus() {
  const pathname = usePathname();
  const previous = useRef(pathname);
  useEffect(() => {
    if (previous.current === pathname) return;
    previous.current = pathname;
    if (document.activeElement === document.body) {
      document.getElementById('main')?.focus({ preventScroll: true });
    }
  }, [pathname]);
  return null;
}
