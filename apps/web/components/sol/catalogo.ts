// Catálogo oficial capturado el 27/09/2026: solo cifras usadas por la representación de la extensión.
import { servicios } from '../../lib/aeat';

export const catalogo = {
  total: servicios.length,
  resultadosRenta: servicios.filter((s) => s.name.toLowerCase().includes('renta')),
};
