/** Convierte un texto libre en un identificador apto para URL. */
export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Tono estable a partir del nombre de la categoría, del que sale todo su color. */
export function categoryHue(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  return Math.abs(hash) % 360;
}

/** Color estable a partir del nombre de la categoría, para su punto de color. */
export function categoryColor(name: string): string {
  return `hsl(${categoryHue(name)} 62% 55%)`;
}
