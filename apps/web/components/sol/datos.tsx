'use client';

import { useEffect, useRef, useState } from 'react';
import { Icono, type NombreIcono } from './icono';
import './datos.css';

// Datos de muestra, inventados. La máscara conserva la longitud: en mono, la píldora no cambia de ancho.
const chips: { icono: NombreIcono; real: string; oculto: string }[] = [
  { icono: 'usuario', real: 'Ana García', oculto: 'A•• G•••••' },
  { icono: 'documento', real: '12345678Z', oculto: '•••••••8Z' },
  { icono: 'ubicacion', real: 'C/ Mayor 3', oculto: 'C/ M•••• •' },
  { icono: 'tarjeta', real: 'ES12 3456', oculto: 'ES12 ••••' },
  { icono: 'telefono', real: '612 345 678', oculto: '6•• ••• •••' },
];

const nunca = [
  'No rellena tus datos',
  'No resuelve el CAPTCHA',
  'No entra en Cl@ve por ti',
  'No envía formularios',
  'No guarda lo que escribes',
  'No tiene servidores propios',
];

export function Datos() {
  const escena = useRef<HTMLDivElement>(null);
  const [activo, setActivo] = useState(false);

  // La animación solo corre con la escena en pantalla.
  useEffect(() => {
    const nodo = escena.current;
    if (!nodo) return;
    const observador = new IntersectionObserver(
      (entradas) => entradas.forEach((entrada) => setActivo(entrada.isIntersecting)),
      { rootMargin: '-15% 0px' },
    );
    observador.observe(nodo);
    return () => observador.disconnect();
  }, []);

  return (
    <section className="datos" aria-labelledby="datos-titulo">
      <div className="datos-texto">
        <h2 id="datos-titulo" className="t-titular-m">
          Tus datos se quedan contigo
        </h2>
        <p className="t-texto-l">Los ocultamos en tu navegador antes de preguntar.</p>
      </div>

      <div
        ref={escena}
        className="datos-escena"
        data-activo={activo || undefined}
        role="img"
        aria-label="Un sol con tu nombre, DNI, dirección, cuenta y teléfono alrededor. Cada dato se oculta antes de salir de tu navegador."
      >
        <div className="datos-planeta" />
        <div className="datos-orbita">
          {chips.map((chip) => (
            <div key={chip.real} className="datos-satelite">
              <div className="datos-contra">
                <div className="datos-chip t-dato">
                  <span className="datos-real">
                    <Icono n={chip.icono} size={14} />
                    {chip.real}
                  </span>
                  <span className="datos-oculto">
                    <Icono n="protegido" size={14} />
                    {chip.oculto}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="datos-nunca">
        <h3 className="t-etiqueta">Lo que la extensión nunca hace</h3>
        <ul className="caja-gris" role="list">
          {nunca.map((texto) => (
            <li key={texto} className="caja-plana">
              <span className="datos-marca">
                <Icono n="nunca" size={14} />
              </span>
              {texto}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
