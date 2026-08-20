/**
 * Prepara las tablas de una entrada publicada.
 *
 * El Markdown solo describe filas y celdas, así que el reparto visual se decide
 * aquí, al cargar: qué columnas son de cifras y qué rótulo lleva cada celda
 * cuando la fila se convierte en ficha en pantallas estrechas.
 */

/** Cifra con separadores y, si acaso, un símbolo o unidad corta pegada. */
const CIFRA = /^[+\-−]?\s*[$€£]?\s*\d[\d.,\s]*\s*(%|°|[a-zµ]{1,4})?$/i;

export function esCifra(texto: string): boolean {
  const limpio = texto.trim();
  return limpio !== '' && CIFRA.test(limpio);
}

export function prepararTablas(raiz: ParentNode = document) {
  for (const tabla of raiz.querySelectorAll<HTMLTableElement>('.body table')) {
    // Envoltura que permite desplazarla en horizontal sin apretujar columnas.
    if (!tabla.parentElement?.classList.contains('tabla-envoltura')) {
      const envoltura = document.createElement('div');
      envoltura.className = 'tabla-envoltura';
      tabla.replaceWith(envoltura);
      envoltura.appendChild(tabla);
    }

    const encabezados = [...tabla.querySelectorAll('thead th')];
    const filas = [...tabla.querySelectorAll('tbody tr')];
    if (filas.length === 0) continue;

    // Etiquetas de fila cortas: mejor en una sola linea. Largas: que se partan,
    // en vez de forzar a desplazar toda la tabla en horizontal.
    const primeras = filas
      .map((fila) => fila.children[0] as HTMLTableCellElement | undefined)
      .filter((c): c is HTMLTableCellElement => !!c);
    const masLarga = Math.max(...primeras.map((c) => (c.textContent ?? '').trim().length), 0);
    if (masLarga <= 24) primeras.forEach((c) => c.classList.add('sin-partir'));

    encabezados.forEach((th, columna) => {
      const celdas = filas
        .map((fila) => fila.children[columna] as HTMLTableCellElement | undefined)
        .filter((c): c is HTMLTableCellElement => !!c);

      // Rótulo para la versión en fichas.
      const rotulo = th.textContent?.trim() ?? '';
      celdas.forEach((celda) => celda.setAttribute('data-col', rotulo));

      // Una columna es de cifras solo si todas sus celdas con contenido lo son.
      const conContenido = celdas.filter((c) => (c.textContent ?? '').trim() !== '');
      if (conContenido.length > 0 && conContenido.every((c) => esCifra(c.textContent ?? ''))) {
        th.classList.add('cifras');
        celdas.forEach((celda) => celda.classList.add('cifras'));
      }
    });
  }
}
