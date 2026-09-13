import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { categoryColor } from './slug';
import {
  FUENTES, FOTO, TEXTO, APAGADO, TENUE, BORDE, FONDO_SUAVE, ACENTO, BLANCO, AUTOR, DOMINIO,
} from './marca';

/**
 * Carrusel para redes: el artículo repartido en láminas de 1080×1350.
 *
 * El reto no es dibujar, es repartir. Se trocea el texto en bloques (títulos,
 * párrafos, puntos de lista, citas) y se van llenando láminas hasta agotar el
 * alto disponible, cortando siempre entre bloques y nunca a mitad de frase.
 *
 * Lo que no se puede contar con texto —tablas, diagramas, imágenes, vídeos— se
 * omite y se informa de cuántos había, para que el autor decida si le importa.
 */

export const ANCHO = 1080;
export const ALTO = 1350;

const MARGEN = 84;
const ANCHO_UTIL = ANCHO - MARGEN * 2;

// Medidas del texto del cuerpo, de las que sale todo el reparto.
const CUERPO = 36;
const INTERLINEA = 1.5;
const ALTO_LINEA = CUERPO * INTERLINEA;

// Alto libre para el texto, descontando cabecera y pie de cada lámina.
const ALTO_CUERPO = ALTO - MARGEN * 2 - 96 - 120;
const LINEAS_POR_LAMINA = Math.floor(ALTO_CUERPO / ALTO_LINEA);

/** Ancho medio de un carácter en Inter, como fracción del tamaño de letra. */
const ANCHO_CARACTER = 0.5;
const CARACTERES_POR_LINEA = Math.floor(ANCHO_UTIL / (CUERPO * ANCHO_CARACTER));

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
function lineasQueOcupa(bloque: Bloque): number {
  const porLinea: Record<TipoBloque, number> = {
    // Los títulos son más grandes, así que caben menos caracteres por línea.
    titulo: Math.floor(CARACTERES_POR_LINEA * 0.72),
    parrafo: CARACTERES_POR_LINEA,
    lista: CARACTERES_POR_LINEA - 3,
    cita: CARACTERES_POR_LINEA - 4,
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
  omitidos: Omitidos;
  /** Bloques que no cupieron por el tope de láminas. */
  recortados: number;
}

/** Reparte los bloques en láminas, cortando siempre entre bloques. */
export function repartir(bloques: Bloque[]): Reparto {
  const contenido: Bloque[][] = [];
  let actual: Bloque[] = [];
  let ocupado = 0;

  for (const bloque of bloques) {
    const coste = lineasQueOcupa(bloque);

    if (actual.length > 0 && ocupado + coste > LINEAS_POR_LAMINA) {
      // Si lo último de la lámina era un título, su texto se iría a la siguiente
      // y el título quedaría solo al final. Se lleva consigo.
      const arrastrado =
        actual[actual.length - 1].tipo === 'titulo' && actual.length > 1
          ? actual.pop()!
          : null;

      contenido.push(actual);
      actual = arrastrado ? [arrastrado] : [];
      ocupado = arrastrado ? lineasQueOcupa(arrastrado) : 0;
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

  return { contenido, omitidos: { tablas: 0, diagramas: 0, imagenes: 0, videos: 0 }, recortados };
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
}

export function prepararCarrusel(cuerpo: string): Carrusel {
  const { bloques, omitidos } = bloquesDe(cuerpo);
  const reparto = repartir(bloques);
  return {
    total: reparto.contenido.length + 2,
    contenido: reparto.contenido,
    omitidos,
    recortados: reparto.recortados,
  };
}

// ── Dibujo ──────────────────────────────────────────────────

const marco = (color: string, hijos: any[]) => ({
  type: 'div',
  props: {
    style: {
      width: `${ANCHO}px`,
      height: `${ALTO}px`,
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: BLANCO,
      padding: `${MARGEN}px`,
      fontFamily: 'Inter',
      borderTop: `14px solid ${color}`,
    },
    children: hijos,
  },
});

const cabecera = (categoria: string, color: string, contador?: string) => ({
  type: 'div',
  props: {
    style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' },
    children: [
      {
        type: 'div',
        props: {
          style: { display: 'flex', alignItems: 'center', gap: '16px' },
          children: [
            { type: 'div', props: { style: { width: '16px', height: '16px', borderRadius: '99px', backgroundColor: color } } },
            {
              type: 'div',
              props: {
                style: { fontSize: '26px', fontWeight: 600, color: APAGADO, letterSpacing: '0.08em', textTransform: 'uppercase' },
                children: categoria,
              },
            },
          ],
        },
      },
      ...(contador
        ? [{ type: 'div', props: { style: { fontSize: '26px', fontWeight: 600, color: TENUE }, children: contador } }]
        : []),
    ],
  },
});

const pie = (derecha: string) => ({
  type: 'div',
  props: {
    style: {
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      borderTop: `1px solid ${BORDE}`, paddingTop: '30px', height: '120px',
    },
    children: [
      {
        type: 'div',
        props: {
          style: { display: 'flex', alignItems: 'center', gap: '18px' },
          children: [
            { type: 'img', props: { src: FOTO, width: 56, height: 56, style: { borderRadius: '99px' } } },
            { type: 'div', props: { style: { fontSize: '28px', fontWeight: 600, color: TEXTO }, children: AUTOR } },
          ],
        },
      },
      { type: 'div', props: { style: { fontSize: '26px', fontWeight: 600, color: ACENTO }, children: derecha } },
    ],
  },
});

/** El título de portada se achica por tramos, para que siempre quepa. */
function tamanoTitulo(titulo: string): number {
  if (titulo.length <= 40) return 92;
  if (titulo.length <= 70) return 76;
  if (titulo.length <= 110) return 62;
  return 52;
}

function dibujarBloque(bloque: Bloque, color: string) {
  if (bloque.tipo === 'titulo') {
    return {
      type: 'div',
      props: {
        style: { fontSize: '46px', fontWeight: 700, color: TEXTO, lineHeight: 1.25, letterSpacing: '-0.02em', marginTop: '16px' },
        children: bloque.texto,
      },
    };
  }
  if (bloque.tipo === 'cita') {
    return {
      type: 'div',
      props: {
        style: {
          display: 'flex', fontSize: `${CUERPO - 2}px`, color: APAGADO, lineHeight: INTERLINEA,
          borderLeft: `5px solid ${color}`, paddingLeft: '24px',
        },
        children: bloque.texto,
      },
    };
  }
  if (bloque.tipo === 'lista') {
    return {
      type: 'div',
      props: {
        style: { display: 'flex', gap: '16px', fontSize: `${CUERPO}px`, color: TEXTO, lineHeight: INTERLINEA },
        children: [
          { type: 'div', props: { style: { color, fontWeight: 700 }, children: '·' } },
          { type: 'div', props: { style: { display: 'flex' }, children: bloque.texto } },
        ],
      },
    };
  }
  return {
    type: 'div',
    props: {
      style: { fontSize: `${CUERPO}px`, color: TEXTO, lineHeight: INTERLINEA },
      children: bloque.texto,
    },
  };
}

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
  const color = categoryColor(datos.categoria);
  const fecha = datos.fecha.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });

  // ── Portada ──
  if (numero === 1) {
    return aPng(marco(color, [
      cabecera(datos.categoria, color),
      {
        type: 'div',
        props: {
          style: { display: 'flex', flexDirection: 'column', justifyContent: 'center', flexGrow: 1, gap: '32px' },
          children: [
            {
              type: 'div',
              props: {
                style: { fontSize: `${tamanoTitulo(datos.titulo)}px`, fontWeight: 700, color: TEXTO, lineHeight: 1.1, letterSpacing: '-0.03em' },
                children: datos.titulo,
              },
            },
            { type: 'div', props: { style: { fontSize: '28px', color: TENUE }, children: fecha } },
          ],
        },
      },
      pie('Desliza →'),
    ]));
  }

  // ── Cierre ──
  if (numero === carrusel.total) {
    return aPng(marco(color, [
      cabecera(datos.categoria, color),
      {
        type: 'div',
        props: {
          style: { display: 'flex', flexDirection: 'column', justifyContent: 'center', flexGrow: 1, gap: '28px' },
          children: [
            { type: 'div', props: { style: { fontSize: '40px', color: APAGADO }, children: 'Sigue leyendo el artículo completo en' } },
            {
              type: 'div',
              props: {
                style: { fontSize: '46px', fontWeight: 700, color: TEXTO, lineHeight: 1.3, letterSpacing: '-0.02em' },
                children: datos.enlace.replace(/^https?:\/\//, ''),
              },
            },
            {
              type: 'div',
              props: {
                style: {
                  display: 'flex', marginTop: '16px', padding: '28px 32px', borderRadius: '16px',
                  backgroundColor: FONDO_SUAVE, fontSize: '32px', color: APAGADO, lineHeight: 1.4,
                },
                children: datos.titulo,
              },
            },
          ],
        },
      },
      pie(DOMINIO),
    ]));
  }

  // ── Contenido ──
  const bloques = carrusel.contenido[numero - 2] ?? [];
  return aPng(marco(color, [
    cabecera(datos.categoria, color, `${numero - 1}/${carrusel.total - 2}`),
    {
      type: 'div',
      props: {
        style: { display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'center', gap: '22px' },
        children: bloques.map((b) => dibujarBloque(b, color)),
      },
    },
    pie(DOMINIO),
  ]));
}
