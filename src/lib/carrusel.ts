import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { FUENTES } from './marca';
import { ANCHO, ALTO, temaDe, type Metricas } from './carrusel-temas';

/**
 * Carrusel para redes: el artículo repartido en láminas de 1080×1350.
 *
 * El reto no es dibujar, es repartir. Se trocea el texto en bloques (títulos,
 * párrafos, puntos de lista, citas) y se van llenando láminas hasta agotar el
 * alto disponible, cortando siempre entre bloques y nunca a mitad de frase.
 *
 * Cuánto cabe depende del tema de la categoría —cada uno tiene su tamaño de
 * letra y sus márgenes—, así que el reparto se hace con sus medidas. El dibujo
 * vive en `carrusel-temas.ts`.
 *
 * Lo que no se puede contar con texto —tablas, diagramas, imágenes, vídeos— se
 * omite y se informa de cuántos había, para que el autor decida si le importa.
 */

export { ANCHO, ALTO };

/** Ancho medio de un carácter en Inter, como fracción del tamaño de letra. */
const ANCHO_CARACTER = 0.5;

/**
 * Tope de láminas de contenido.
 *
 * Instagram admite 20 imágenes por carrusel, y LinkedIn otras tantas: con la
 * portada y el cierre, quedan 18 para el texto. Un artículo largo no cabrá
 * entero, y para eso está la última lámina con el enlace.
 */
const MAXIMO_CONTENIDO = 18;

export type TipoBloque = 'titulo' | 'parrafo' | 'lista' | 'cita';

export interface Bloque {
  tipo: TipoBloque;
  texto: string;
}

export interface Omitidos {
  tablas: number;
  diagramas: number;
  imagenes: number;
  videos: number;
}

/** Limpia las marcas de Markdown que no se dibujan, dejando solo el texto. */
function soloTexto(linea: string): string {
  return linea
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    // Markdown escapa con barra los caracteres que tienen significado propio;
    // al pasar a texto plano esa barra sobra y se veria suelta.
    .replace(/\\([\\`*_{}\[\]()#+\-.!|>~])/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Trocea el Markdown de una entrada en bloques dibujables. */
export function bloquesDe(markdown: string): { bloques: Bloque[]; omitidos: Omitidos } {
  const bloques: Bloque[] = [];
  const omitidos: Omitidos = { tablas: 0, diagramas: 0, imagenes: 0, videos: 0 };

  const lineas = markdown.split(/\r?\n/);
  let parrafo: string[] = [];
  let enCodigo = false;
  let enTabla = false;

  const cerrarParrafo = () => {
    const texto = soloTexto(parrafo.join(' '));
    if (texto) bloques.push({ tipo: 'parrafo', texto });
    parrafo = [];
  };

  for (const cruda of lineas) {
    const linea = cruda.trimEnd();

    // Diagramas y código: se cuentan y se saltan enteros.
    if (/^```/.test(linea.trim())) {
      if (!enCodigo) { cerrarParrafo(); omitidos.diagramas++; }
      enCodigo = !enCodigo;
      continue;
    }
    if (enCodigo) continue;

    // Tablas: se cuenta una por bloque de filas seguidas.
    if (/^\s*\|/.test(linea)) {
      if (!enTabla) { cerrarParrafo(); omitidos.tablas++; enTabla = true; }
      continue;
    }
    enTabla = false;

    // Bloques de HTML propios del editor.
    if (/<figure/.test(linea)) { cerrarParrafo(); omitidos.imagenes++; continue; }
    if (/<div class="video"/.test(linea)) { cerrarParrafo(); omitidos.videos++; continue; }
    if (/<aside/.test(linea)) {
      cerrarParrafo();
      const dentro = soloTexto(linea);
      if (dentro) bloques.push({ tipo: 'cita', texto: dentro });
      continue;
    }

    if (linea.trim() === '') { cerrarParrafo(); continue; }

    const titulo = /^#{1,6}\s+(.*)$/.exec(linea);
    if (titulo) {
      cerrarParrafo();
      const texto = soloTexto(titulo[1]);
      if (texto) bloques.push({ tipo: 'titulo', texto });
      continue;
    }

    const cita = /^>\s?(.*)$/.exec(linea);
    if (cita) {
      cerrarParrafo();
      const texto = soloTexto(cita[1]);
      if (texto) bloques.push({ tipo: 'cita', texto });
      continue;
    }

    const punto = /^\s*(?:[-*+]|\d+\.)\s+(.*)$/.exec(linea);
    if (punto) {
      cerrarParrafo();
      const texto = soloTexto(punto[1]);
      if (texto) bloques.push({ tipo: 'lista', texto });
      continue;
    }

    parrafo.push(linea.trim());
  }
  cerrarParrafo();

  return { bloques, omitidos };
}

/** Cuántas líneas ocupa un bloque, contando su separación con el siguiente. */
function lineasQueOcupa(bloque: Bloque, caracteresPorLinea: number): number {
  const porLinea: Record<TipoBloque, number> = {
    // Los títulos son más grandes, así que caben menos caracteres por línea.
    titulo: Math.floor(caracteresPorLinea * 0.72),
    parrafo: caracteresPorLinea,
    lista: caracteresPorLinea - 3,
    cita: caracteresPorLinea - 4,
  };
  const separacion: Record<TipoBloque, number> = {
    titulo: 1.4, parrafo: 0.7, lista: 0.35, cita: 1,
  };
  const alto: Record<TipoBloque, number> = {
    titulo: 1.35, parrafo: 1, lista: 1, cita: 1.05,
  };

  const lineas = Math.max(1, Math.ceil(bloque.texto.length / porLinea[bloque.tipo]));
  return lineas * alto[bloque.tipo] + separacion[bloque.tipo];
}

export interface Reparto {
  /** Cada lámina de contenido, con los bloques que le tocan. */
  contenido: Bloque[][];
  /** Bloques que no cupieron por el tope de láminas. */
  recortados: number;
}

/** Reparte los bloques en láminas, cortando siempre entre bloques. */
export function repartir(bloques: Bloque[], m: Metricas): Reparto {
  const lineasPorLamina = Math.floor(
    (ALTO - m.margen * 2 - m.cabecera - m.pie) / (m.cuerpo * m.interlinea),
  );
  const caracteresPorLinea = Math.floor((ANCHO - m.margen * 2) / (m.cuerpo * ANCHO_CARACTER));

  const contenido: Bloque[][] = [];
  let actual: Bloque[] = [];
  let ocupado = 0;

  for (const bloque of bloques) {
    const coste = lineasQueOcupa(bloque, caracteresPorLinea);

    if (actual.length > 0 && ocupado + coste > lineasPorLamina) {
      // Si lo último de la lámina era un título, su texto se iría a la siguiente
      // y el título quedaría solo al final. Se lleva consigo.
      const arrastrado =
        actual[actual.length - 1].tipo === 'titulo' && actual.length > 1
          ? actual.pop()!
          : null;

      contenido.push(actual);
      actual = arrastrado ? [arrastrado] : [];
      ocupado = arrastrado ? lineasQueOcupa(arrastrado, caracteresPorLinea) : 0;
    }

    // Un bloque más largo que una lámina entera va solo: se dibujará apretado,
    // que es mejor que partirlo por la mitad.
    actual.push(bloque);
    ocupado += coste;
  }
  if (actual.length > 0) contenido.push(actual);

  let recortados = 0;
  if (contenido.length > MAXIMO_CONTENIDO) {
    recortados = contenido.slice(MAXIMO_CONTENIDO).reduce((n, l) => n + l.length, 0);
    contenido.length = MAXIMO_CONTENIDO;
  }

  return { contenido, recortados };
}

export interface DatosCarrusel {
  titulo: string;
  categoria: string;
  fecha: Date;
  enlace: string;
  cuerpo: string;
}

export interface Carrusel {
  /** Número total de láminas, portada y cierre incluidas. */
  total: number;
  contenido: Bloque[][];
  omitidos: Omitidos;
  recortados: number;
  /** Nombre de la silueta que le toca a la categoría. */
  tema: string;
}

export function prepararCarrusel(cuerpo: string, categoria: string): Carrusel {
  const tema = temaDe(categoria);
  const { bloques, omitidos } = bloquesDe(cuerpo);
  const reparto = repartir(bloques, tema.metricas);
  return {
    total: reparto.contenido.length + 2,
    contenido: reparto.contenido,
    omitidos,
    recortados: reparto.recortados,
    tema: tema.nombre,
  };
}

// ── Dibujo ──────────────────────────────────────────────────

async function aPng(maqueta: any): Promise<Buffer> {
  const svg = await satori(maqueta, { width: ANCHO, height: ALTO, fonts: FUENTES });
  return Buffer.from(new Resvg(svg).render().asPng());
}

/**
 * Dibuja una lámina. La primera es la portada, la última el cierre con el
 * enlace, y las de en medio llevan el texto que les tocó en el reparto.
 */
export async function generarLamina(
  datos: DatosCarrusel,
  carrusel: Carrusel,
  numero: number,
): Promise<Buffer> {
  const tema = temaDe(datos.categoria);
  const lamina = {
    titulo: datos.titulo,
    categoria: datos.categoria,
    fecha: datos.fecha.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }),
    enlace: datos.enlace.replace(/^https?:\/\//, ''),
    numero,
    total: carrusel.total,
  };

  if (numero === 1) return aPng(tema.portada(lamina));
  if (numero === carrusel.total) return aPng(tema.cierre(lamina));
  return aPng(tema.contenido(lamina, carrusel.contenido[numero - 2] ?? []));
}
