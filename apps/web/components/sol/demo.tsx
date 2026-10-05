// Demo: la web real de la Agencia Tributaria, original y mejorada, sobre el atardecer.
// La demo trae su tipografía; aquí se fuerza Geist y Geist Mono por variables de alcance.
import DemoTransform from '../../landing/DemoTransform';
import './demo.css';

export function Demo() {
  return (
    <section className="dm" aria-labelledby="dm-titulo">
      <header className="dm-cabeza">
        <p className="t-etiqueta">Pruébalo</p>
        <h2 id="dm-titulo" className="t-titular-m">
          Compruébalo con la web de verdad
        </h2>
      </header>
      <div className="dm-sol">
        {/* La vista original tiene 89 botones seguidos: con teclado, se pueden saltar. */}
        <a className="boton-claro dm-saltar" href="#dm-fin">
          Saltar la demo
        </a>
        <p className="dm-guia">
          Es el catálogo real de la Agencia Tributaria. Pulsa <b>Mejorada</b> y busca «renta».
        </p>
        <DemoTransform compact initialView="legacy" />
      </div>
      <span id="dm-fin" />
    </section>
  );
}
