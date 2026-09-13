import { categoryHue } from './slug';
import { FOTO, AUTOR, DOMINIO } from './marca';
import type { Bloque } from './carrusel';

/**
 * Temas del carrusel: cuatro variantes de una misma familia.
 *
 * Todas hablan el mismo idioma —bloques de color sólido, Inter, tarjetas
 * blancas— pero cada categoría tiene su silueta y su color, para que dos
 * entradas seguidas en el feed no se confundan entre sí.
 */

export const ANCHO = 1080;
export const ALTO = 1350;

const NEGRO = '#191714';
const APAGADO = '#6B655C';
const LINEA = '#EAE6DE';
const BLANCO = '#FFFFFF';

export interface Metricas {
  /** Tamaño del texto del cuerpo, del que sale todo el reparto. */
  cuerpo: number;
  interlinea: number;
  /** Margen horizontal total a cada lado, sumando marcos y tarjetas. */
  margen: number;
  /** Alto reservado arriba del cuerpo. */
  cabecera: number;
  /** Alto reservado abajo del cuerpo. */
  pie: number;
}

export interface DatosLamina {
  titulo: string;
  categoria: string;
  /** Fecha ya escrita en palabras. */
  fecha: string;
  /** Enlace sin el protocolo, que en una imagen no aporta nada. */
  enlace: string;
  numero: number;
  total: number;
}

export interface Tema {
  nombre: string;
  metricas: Metricas;
  portada(datos: DatosLamina): any;
  contenido(datos: DatosLamina, bloques: Bloque[]): any;
  cierre(datos: DatosLamina): any;
}

// ── Color de la categoría ───────────────────────────────────────

export interface Paleta {
  /** Para fondos grandes: oscuro para que el texto blanco se lea. */
  solido: string;
  /** Para detalles sobre blanco: rótulos, viñetas, contadores. */
  vivo: string;
  /** Fondo apenas teñido, para cajas dentro de una lámina clara. */
  tenue: string;
}

export function paletaDe(categoria: string): Paleta {
  const h = tonoDe(categoria);
  return {
    solido: `hsl(${h} 55% 33%)`,
    vivo: `hsl(${h} 58% 42%)`,
    tenue: `hsl(${h} 45% 96%)`,
  };
}

// ── Piezas compartidas ──────────────────────────────────────────

const div = (style: any, children: any[]) => ({
  type: 'div',
  props: { style: { display: 'flex', ...style }, children },
});
const txt = (style: any, texto: string) => ({ type: 'div', props: { style, children: texto } });
const foto = (tam: number, anillo?: string) => ({
  type: 'img',
  props: {
    src: FOTO, width: tam, height: tam,
    style: { borderRadius: '999px', ...(anillo ? { border: `3px solid ${anillo}` } : {}) },
  },
});
const hueco = () => div({ flexGrow: 1 }, []);

/** Rótulo de categoría en versalitas. */
const rotulo = (texto: string, color: string) =>
  txt({
    fontSize: '24px', fontWeight: 700, color,
    letterSpacing: '0.16em', textTransform: 'uppercase',
  }, texto);

/** Pie sobre fondo claro: firma a la izquierda, dominio a la derecha. */
const pieClaro = (alto: number, color: string, conFilete = true) =>
  div({
    alignItems: 'center', justifyContent: 'space-between', height: `${alto}px`,
    paddingTop: '32px', ...(conFilete ? { borderTop: `1px solid ${LINEA}` } : {}),
  }, [
    div({ alignItems: 'center', gap: '18px' }, [
      foto(54),
      txt({ fontSize: '28px', fontWeight: 600, color: NEGRO }, AUTOR),
    ]),
    txt({ fontSize: '26px', fontWeight: 600, color }, DOMINIO),
  ]);

/** Pie sobre fondo de color: todo en blanco, con la marca a la derecha. */
const pieColor = (alto: number, derecha?: any) =>
  div({ alignItems: 'center', justifyContent: 'space-between', height: `${alto}px`, paddingTop: '32px' }, [
    div({ alignItems: 'center', gap: '20px' }, [
      foto(60, 'rgba(255,255,255,0.9)'),
      txt({ fontSize: '29px', fontWeight: 600, color: BLANCO }, AUTOR),
    ]),
    derecha ?? txt({ fontSize: '26px', fontWeight: 600, color: 'rgba(255,255,255,0.85)' }, DOMINIO),
  ]);

/** Píldora blanca de llamada a la acción. */
const pildora = (texto: string, color: string) =>
  txt({
    fontSize: '26px', fontWeight: 700, color, backgroundColor: BLANCO,
    borderRadius: '999px', padding: '14px 28px',
  }, texto);

/** Contador en caja de color, sobre fondo claro. */
const contador = (datos: DatosLamina, fondo: string) =>
  txt({
    fontSize: '25px', fontWeight: 700, color: BLANCO, backgroundColor: fondo,
    borderRadius: '10px', padding: '8px 18px',
  }, `${datos.numero - 1}/${datos.total - 2}`);

/** El título de portada se achica por tramos, para que siempre quepa. */
function tamanoTitulo(titulo: string, maximo = 96): number {
  if (titulo.length <= 40) return maximo;
  if (titulo.length <= 70) return Math.round(maximo * 0.82);
  if (titulo.length <= 110) return Math.round(maximo * 0.67);
  return Math.round(maximo * 0.56);
}

/** Dibuja los bloques del cuerpo. Solo cambia el color del acento. */
function cuerpo(bloques: Bloque[], m: Metricas, color: string, sobreColor: boolean) {
  const texto = sobreColor ? BLANCO : NEGRO;
  const suave = sobreColor ? 'rgba(255,255,255,0.75)' : APAGADO;

  return div({ flexDirection: 'column', flexGrow: 1, justifyContent: 'center', gap: '26px' },
    bloques.map((b) => {
      if (b.tipo === 'titulo') {
        return div({ marginTop: '14px' }, [
          txt({
            fontSize: '50px', fontWeight: 700, color: texto, lineHeight: 1.2, letterSpacing: '-0.02em',
            borderBottom: `6px solid ${sobreColor ? 'rgba(255,255,255,0.55)' : color}`, paddingBottom: '12px',
          }, b.texto),
        ]);
      }
      if (b.tipo === 'cita') {
        return div({
          backgroundColor: sobreColor ? 'rgba(255,255,255,0.12)' : '#F6F4F0',
          borderRadius: '16px', padding: '28px 30px',
        }, [
          txt({ fontSize: `${m.cuerpo - 3}px`, color: suave, lineHeight: m.interlinea }, b.texto),
        ]);
      }
      if (b.tipo === 'lista') {
        return div({ gap: '20px', fontSize: `${m.cuerpo}px`, color: texto, lineHeight: m.interlinea }, [
          div({
            width: '12px', height: '12px', borderRadius: '3px', flexShrink: 0,
            marginTop: `${Math.round(m.cuerpo * 0.55)}px`,
            backgroundColor: sobreColor ? BLANCO : color,
          }, []),
          txt({ display: 'flex', flexShrink: 1 }, b.texto),
        ]);
      }
      return txt({ fontSize: `${m.cuerpo}px`, color: texto, lineHeight: m.interlinea }, b.texto);
    }),
  );
}

/** Marco exterior con relleno uniforme. */
const lamina = (fondo: string, relleno: number, hijos: any[], direccion = 'column') =>
  div({
    width: `${ANCHO}px`, height: `${ALTO}px`, flexDirection: direccion,
    backgroundColor: fondo, padding: `${relleno}px`, fontFamily: 'Inter',
  }, hijos);

/** Marco exterior sin relleno, para las siluetas que sangran al borde. */
const laminaSangrada = (fondo: string, hijos: any[]) =>
  div({
    width: `${ANCHO}px`, height: `${ALTO}px`, flexDirection: 'column',
    backgroundColor: fondo, fontFamily: 'Inter',
  }, hijos);

// ═══════════════════════════════════════════════════════════════
// 1 · PLENO — portada y cierre a todo color, contenido con banda
// ═══════════════════════════════════════════════════════════════
function temaPleno(categoria: string): Tema {
  const c = paletaDe(categoria);
  const m: Metricas = { cuerpo: 42, interlinea: 1.55, margen: 88, cabecera: 66, pie: 112 };
  const BANDA = 22;

  return {
    nombre: 'Pleno',
    metricas: { ...m, margen: m.margen + BANDA / 2 },

    portada: (d) => lamina(c.solido, m.margen, [
      div({ alignItems: 'center', height: `${m.cabecera}px` }, [
        txt({
          fontSize: '24px', fontWeight: 700, color: BLANCO, letterSpacing: '0.16em',
          textTransform: 'uppercase', border: '2px solid rgba(255,255,255,0.5)',
          borderRadius: '999px', padding: '10px 24px',
        }, d.categoria),
      ]),
      hueco(),
      txt({
        fontSize: `${tamanoTitulo(d.titulo)}px`, fontWeight: 700, color: BLANCO,
        lineHeight: 1.05, letterSpacing: '-0.035em',
      }, d.titulo),
      txt({ fontSize: '30px', color: 'rgba(255,255,255,0.78)', marginTop: '36px' }, d.fecha),
      hueco(),
      pieColor(m.pie, pildora('Desliza →', c.solido)),
    ]),

    contenido: (d, bloques) => lamina(BLANCO, 0, [
      div({ width: `${BANDA}px`, height: `${ALTO}px`, backgroundColor: c.solido }, []),
      div({ flexDirection: 'column', flexGrow: 1, padding: `${m.margen}px` }, [
        div({ alignItems: 'center', justifyContent: 'space-between', height: `${m.cabecera}px` }, [
          rotulo(d.categoria, c.vivo),
          contador(d, c.solido),
        ]),
        cuerpo(bloques, m, c.vivo, false),
        pieClaro(m.pie, c.vivo),
      ]),
    ], 'row'),

    cierre: (d) => lamina(c.solido, m.margen, [
      div({ height: `${m.cabecera}px` }, []),
      hueco(),
      txt({ fontSize: '58px', fontWeight: 700, color: BLANCO, lineHeight: 1.15, letterSpacing: '-0.03em' }, 'Sigue leyendo'),
      div({
        flexDirection: 'column', marginTop: '44px', padding: '40px',
        borderRadius: '22px', backgroundColor: BLANCO,
      }, [
        rotulo('Artículo completo', APAGADO),
        txt({ fontSize: '38px', fontWeight: 700, color: NEGRO, lineHeight: 1.35, marginTop: '18px' }, d.enlace),
      ]),
      hueco(),
      pieColor(m.pie),
    ]),
  };
}

// ═══════════════════════════════════════════════════════════════
// 2 · MITAD — corte horizontal: color arriba, texto abajo
// ═══════════════════════════════════════════════════════════════
function temaMitad(categoria: string): Tema {
  const c = paletaDe(categoria);
  const FRANJA = 150;
  const m: Metricas = { cuerpo: 42, interlinea: 1.55, margen: 88, cabecera: FRANJA, pie: 112 };

  return {
    nombre: 'Mitad',
    metricas: m,

    portada: (d) => laminaSangrada(BLANCO, [
      div({
        flexDirection: 'column', justifyContent: 'space-between', height: '560px',
        backgroundColor: c.solido, padding: `${m.margen}px`,
      }, [
        rotulo(d.categoria, 'rgba(255,255,255,0.85)'),
        div({ alignItems: 'center', gap: '20px' }, [
          foto(60, 'rgba(255,255,255,0.9)'),
          txt({ fontSize: '29px', fontWeight: 600, color: BLANCO }, AUTOR),
        ]),
      ]),
      div({ flexDirection: 'column', flexGrow: 1, padding: `${m.margen}px` }, [
        hueco(),
        txt({
          fontSize: `${tamanoTitulo(d.titulo, 88)}px`, fontWeight: 700, color: NEGRO,
          lineHeight: 1.08, letterSpacing: '-0.035em',
        }, d.titulo),
        txt({ fontSize: '29px', color: APAGADO, marginTop: '30px' }, d.fecha),
        hueco(),
        div({ alignItems: 'center', justifyContent: 'space-between' }, [
          txt({ fontSize: '27px', fontWeight: 600, color: c.vivo }, DOMINIO),
          txt({ fontSize: '27px', fontWeight: 700, color: c.vivo }, 'Desliza →'),
        ]),
      ]),
    ]),

    contenido: (d, bloques) => laminaSangrada(BLANCO, [
      div({
        alignItems: 'center', justifyContent: 'space-between', height: `${FRANJA}px`,
        backgroundColor: c.solido, padding: `0 ${m.margen}px`,
      }, [
        rotulo(d.categoria, 'rgba(255,255,255,0.85)'),
        txt({ fontSize: '27px', fontWeight: 700, color: BLANCO }, `${d.numero - 1}/${d.total - 2}`),
      ]),
      div({ flexDirection: 'column', flexGrow: 1, padding: `${m.margen}px` }, [
        cuerpo(bloques, m, c.vivo, false),
        pieClaro(m.pie, c.vivo),
      ]),
    ]),

    cierre: (d) => laminaSangrada(BLANCO, [
      div({ flexDirection: 'column', justifyContent: 'center', height: '520px', padding: `${m.margen}px` }, [
        rotulo(d.categoria, c.vivo),
        txt({
          fontSize: '62px', fontWeight: 700, color: NEGRO, lineHeight: 1.15,
          letterSpacing: '-0.03em', marginTop: '26px',
        }, 'Sigue leyendo'),
        txt({ fontSize: '30px', color: APAGADO, lineHeight: 1.45, marginTop: '22px' }, d.titulo),
      ]),
      div({
        flexDirection: 'column', flexGrow: 1,
        backgroundColor: c.solido, padding: `${m.margen}px`,
      }, [
        div({ flexDirection: 'column', justifyContent: 'center', flexGrow: 1 }, [
          rotulo('Artículo completo', 'rgba(255,255,255,0.8)'),
          txt({
            fontSize: '40px', fontWeight: 700, color: BLANCO,
            lineHeight: 1.35, marginTop: '20px',
          }, d.enlace),
        ]),
        pieColor(m.pie),
      ]),
    ]),
  };
}

// ═══════════════════════════════════════════════════════════════
// 3 · MARCO — todas las láminas son una tarjeta blanca sobre color
// ═══════════════════════════════════════════════════════════════
function temaMarco(categoria: string): Tema {
  const c = paletaDe(categoria);
  const MARCO = 46;
  const DENTRO = 74;
  const m: Metricas = { cuerpo: 40, interlinea: 1.55, margen: MARCO + DENTRO, cabecera: 62, pie: 106 };

  const tarjeta = (hijos: any[]) => lamina(c.solido, MARCO, [
    div({
      flexDirection: 'column', flexGrow: 1, backgroundColor: BLANCO,
      borderRadius: '28px', padding: `${DENTRO}px`,
    }, hijos),
  ]);

  return {
    nombre: 'Marco',
    metricas: m,

    portada: (d) => tarjeta([
      div({ alignItems: 'center', height: `${m.cabecera}px` }, [rotulo(d.categoria, c.vivo)]),
      hueco(),
      div({ width: '96px', height: '8px', borderRadius: '999px', backgroundColor: c.solido }, []),
      txt({
        fontSize: `${tamanoTitulo(d.titulo, 86)}px`, fontWeight: 700, color: NEGRO,
        lineHeight: 1.08, letterSpacing: '-0.035em', marginTop: '34px',
      }, d.titulo),
      txt({ fontSize: '28px', color: APAGADO, marginTop: '28px' }, d.fecha),
      hueco(),
      div({ alignItems: 'center', justifyContent: 'space-between', height: `${m.pie}px`, paddingTop: '32px', borderTop: `1px solid ${LINEA}` }, [
        div({ alignItems: 'center', gap: '18px' }, [
          foto(54),
          txt({ fontSize: '28px', fontWeight: 600, color: NEGRO }, AUTOR),
        ]),
        txt({
          fontSize: '25px', fontWeight: 700, color: BLANCO, backgroundColor: c.solido,
          borderRadius: '999px', padding: '12px 24px',
        }, 'Desliza →'),
      ]),
    ]),

    contenido: (d, bloques) => tarjeta([
      div({ alignItems: 'center', justifyContent: 'space-between', height: `${m.cabecera}px` }, [
        rotulo(d.categoria, c.vivo),
        contador(d, c.solido),
      ]),
      cuerpo(bloques, m, c.vivo, false),
      pieClaro(m.pie, c.vivo),
    ]),

    cierre: (d) => tarjeta([
      div({ alignItems: 'center', height: `${m.cabecera}px` }, [rotulo(d.categoria, c.vivo)]),
      hueco(),
      txt({ fontSize: '54px', fontWeight: 700, color: NEGRO, lineHeight: 1.15, letterSpacing: '-0.03em' }, 'Sigue leyendo'),
      div({
        flexDirection: 'column', marginTop: '36px', padding: '34px 36px',
        borderRadius: '18px', backgroundColor: c.tenue, borderLeft: `6px solid ${c.solido}`,
      }, [
        txt({ fontSize: '36px', fontWeight: 700, color: c.solido, lineHeight: 1.35 }, d.enlace),
      ]),
      txt({ fontSize: '30px', color: APAGADO, lineHeight: 1.45, marginTop: '28px' }, d.titulo),
      hueco(),
      pieClaro(m.pie, c.vivo),
    ]),
  };
}

// ═══════════════════════════════════════════════════════════════
// 4 · INVERTIDO — el texto va sobre el color, las tapas en blanco
// ═══════════════════════════════════════════════════════════════
function temaInvertido(categoria: string): Tema {
  const c = paletaDe(categoria);
  const m: Metricas = { cuerpo: 42, interlinea: 1.55, margen: 88, cabecera: 66, pie: 112 };

  return {
    nombre: 'Invertido',
    metricas: m,

    portada: (d) => lamina(BLANCO, m.margen, [
      div({ alignItems: 'center', height: `${m.cabecera}px` }, [rotulo(d.categoria, c.vivo)]),
      hueco(),
      txt({
        fontSize: `${tamanoTitulo(d.titulo, 94)}px`, fontWeight: 700, color: c.solido,
        lineHeight: 1.05, letterSpacing: '-0.035em',
      }, d.titulo),
      div({
        width: '100%', height: '10px', borderRadius: '999px',
        backgroundColor: c.solido, marginTop: '40px',
      }, []),
      txt({ fontSize: '29px', color: APAGADO, marginTop: '28px' }, d.fecha),
      hueco(),
      div({ alignItems: 'center', justifyContent: 'space-between', height: `${m.pie}px`, paddingTop: '32px' }, [
        div({ alignItems: 'center', gap: '18px' }, [
          foto(54),
          txt({ fontSize: '28px', fontWeight: 600, color: NEGRO }, AUTOR),
        ]),
        txt({
          fontSize: '25px', fontWeight: 700, color: BLANCO, backgroundColor: c.solido,
          borderRadius: '999px', padding: '12px 24px',
        }, 'Desliza →'),
      ]),
    ]),

    contenido: (d, bloques) => lamina(c.solido, m.margen, [
      div({ alignItems: 'center', justifyContent: 'space-between', height: `${m.cabecera}px` }, [
        rotulo(d.categoria, 'rgba(255,255,255,0.8)'),
        txt({
          fontSize: '25px', fontWeight: 700, color: c.solido, backgroundColor: BLANCO,
          borderRadius: '10px', padding: '8px 18px',
        }, `${d.numero - 1}/${d.total - 2}`),
      ]),
      cuerpo(bloques, m, BLANCO, true),
      div({
        alignItems: 'center', justifyContent: 'space-between', height: `${m.pie}px`,
        paddingTop: '32px', borderTop: '1px solid rgba(255,255,255,0.25)',
      }, [
        div({ alignItems: 'center', gap: '18px' }, [
          foto(54, 'rgba(255,255,255,0.9)'),
          txt({ fontSize: '28px', fontWeight: 600, color: BLANCO }, AUTOR),
        ]),
        txt({ fontSize: '26px', fontWeight: 600, color: 'rgba(255,255,255,0.85)' }, DOMINIO),
      ]),
    ]),

    cierre: (d) => lamina(BLANCO, m.margen, [
      div({ alignItems: 'center', height: `${m.cabecera}px` }, [rotulo(d.categoria, c.vivo)]),
      hueco(),
      txt({ fontSize: '58px', fontWeight: 700, color: c.solido, lineHeight: 1.15, letterSpacing: '-0.03em' }, 'Sigue leyendo'),
      div({
        flexDirection: 'column', marginTop: '38px', padding: '38px 40px',
        borderRadius: '22px', backgroundColor: c.solido,
      }, [
        rotulo('Artículo completo', 'rgba(255,255,255,0.8)'),
        txt({ fontSize: '36px', fontWeight: 700, color: BLANCO, lineHeight: 1.35, marginTop: '18px' }, d.enlace),
      ]),
      txt({ fontSize: '30px', color: APAGADO, lineHeight: 1.45, marginTop: '28px' }, d.titulo),
      hueco(),
      pieClaro(m.pie, c.vivo),
    ]),
  };
}

// ── Reparto de temas ────────────────────────────────────────────

const CONSTRUCTORES = [temaPleno, temaMitad, temaMarco, temaInvertido];

/**
 * Qué silueta y qué color le toca a cada categoría.
 *
 * Está escrito a mano porque es una decisión de gusto, no de cálculo: el tono
 * que sale del nombre deja parejas demasiado parecidas, y lo que se busca aquí
 * es justo lo contrario, que dos entradas seguidas en el feed no se confundan.
 * Una categoría nueva cae en una silueta y un tono estables según su nombre, y
 * si no convencen se añade aquí.
 */
const POR_CATEGORIA: Record<string, { tema: number; tono: number }> = {
  'análisis de datos': { tema: 0, tono: 14 },   // terracota
  'ciencia de datos': { tema: 1, tono: 206 },   // azul
  'producto': { tema: 2, tono: 282 },           // morado
  'personal': { tema: 3, tono: 152 },           // verde
};

const asignado = (categoria: string) => POR_CATEGORIA[categoria.trim().toLowerCase()];

/** Tono de la categoría en el carrusel. */
function tonoDe(categoria: string): number {
  return asignado(categoria)?.tono ?? categoryHue(categoria);
}

export function temaDe(categoria: string): Tema {
  const indice = asignado(categoria)?.tema ?? categoryHue(categoria) % CONSTRUCTORES.length;
  return CONSTRUCTORES[indice](categoria);
}
