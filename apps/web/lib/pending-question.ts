// La pregunta escrita en la portada pasa al chat sin salir del dispositivo: ni en la URL ni en
// el servidor. El chat la envía con el mismo flujo que una pregunta escrita allí, protección
// de datos personales incluida.
const clave = 'reforma:pregunta-pendiente';

// sessionStorage lanza si el navegador bloquea el almacenamiento; entonces el chat abre vacío.
export function savePendingQuestion(question: string) {
  try {
    sessionStorage.setItem(clave, question);
  } catch {
    /* El chat abre sin la pregunta. */
  }
}

export function takePendingQuestion() {
  try {
    const question = sessionStorage.getItem(clave) ?? '';
    sessionStorage.removeItem(clave);
    return question;
  } catch {
    return '';
  }
}
