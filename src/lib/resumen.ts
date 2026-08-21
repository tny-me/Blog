/**
 * Entradilla para la vista previa al compartir.
 *
 * Si la entrada trae resumen propio se usa ese. Si no, se saca del comienzo del
 * texto: se descartan los bloques que no son prosa (diagramas, tablas, recuadros
 * de HTML) y se corta en la última palabra entera que quepa.
 */
export function resumenDe(cuerpo: string, propio?: string, largo = 155): string {
  if (propio?.trim()) return propio.trim();

  const prosa = cuerpo
    .replace(/```[\s\S]*?```/g, ' ')        // bloques de código y diagramas
    .replace(/<[^>]+>/g, ' ')               // recuadros, figuras, vídeos
    .replace(/^\|.*$/gm, ' ')               // filas de tabla
    .replace(/^#{1,6}\s+.*$/gm, ' ')        // títulos
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')  // imágenes
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')// enlaces: solo su texto
    .replace(/[*_`>#-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (prosa.length <= largo) return prosa;
  const recorte = prosa.slice(0, largo);
  const corte = recorte.lastIndexOf(' ');
  return (corte > largo * 0.6 ? recorte.slice(0, corte) : recorte).trimEnd() + '…';
}
