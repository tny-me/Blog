import { readFileSync } from 'node:fs';
import { FOTO_PERFIL } from './perfil';

/**
 * Piezas de marca compartidas por todo lo que se dibuja como imagen: la tarjeta
 * de vista previa al compartir y las láminas del carrusel para redes.
 *
 * Al compilar, estos módulos se ejecutan desde la carpeta de salida, así que las
 * rutas se resuelven desde la raíz del proyecto y no desde el propio archivo.
 */
const leer = (ruta: string) => readFileSync(new URL(ruta, `file://${process.cwd()}/`));

export const FUENTES = [
  { name: 'Inter', data: leer('src/assets/fuentes/Inter-Regular.ttf'), weight: 400 as const, style: 'normal' as const },
  { name: 'Inter', data: leer('src/assets/fuentes/Inter-SemiBold.ttf'), weight: 600 as const, style: 'normal' as const },
  { name: 'Inter', data: leer('src/assets/fuentes/Inter-Bold.ttf'), weight: 700 as const, style: 'normal' as const },
];

export const FOTO =
  'data:image/jpeg;base64,' +
  leer(`public/${FOTO_PERFIL}`).toString('base64');

export const TEXTO = '#37352F';
export const APAGADO = '#787774';
export const TENUE = '#9B9A97';
export const BORDE = '#E9E9E7';
export const FONDO_SUAVE = '#F7F7F5';
export const ACENTO = '#D9730D';
export const BLANCO = '#FFFFFF';

export const AUTOR = 'Tonny';
export const DOMINIO = 'tonny.blog';
