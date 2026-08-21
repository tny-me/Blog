import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFileSync } from 'node:fs';
import { categoryColor } from './slug';

/**
 * Tarjeta de vista previa para cuando se comparte el enlace de una entrada.
 *
 * Se genera al compilar, una por entrada, con la paleta del sitio. Satori
 * convierte la maqueta a SVG dibujando el texto como trazos —así no hace falta
 * que el sistema tenga la tipografía instalada— y resvg lo pasa a PNG.
 */

// Al compilar, este modulo se ejecuta desde la carpeta de salida, asi que las
// rutas se resuelven desde la raiz del proyecto y no desde el propio archivo.
const leer = (ruta: string) => readFileSync(new URL(ruta, `file://${process.cwd()}/`));

const FUENTES = [
  { name: 'Inter', data: leer('src/assets/fuentes/Inter-Regular.ttf'), weight: 400 as const, style: 'normal' as const },
  { name: 'Inter', data: leer('src/assets/fuentes/Inter-SemiBold.ttf'), weight: 600 as const, style: 'normal' as const },
  { name: 'Inter', data: leer('src/assets/fuentes/Inter-Bold.ttf'), weight: 700 as const, style: 'normal' as const },
];

const FOTO =
  'data:image/jpeg;base64,' +
  leer('public/assets/img/ia/photo_perfil_antonio.jpeg').toString('base64');

const TEXTO = '#37352F';
const APAGADO = '#787774';
const BORDE = '#E9E9E7';
const ACENTO = '#D9730D';

/** El título manda: cuanto más largo, más pequeño, para que siempre quepa. */
function tamanoTitulo(titulo: string): number {
  if (titulo.length <= 40) return 68;
  if (titulo.length <= 70) return 58;
  if (titulo.length <= 100) return 48;
  return 40;
}

export interface DatosTarjeta {
  titulo: string;
  categoria: string;
  resumen?: string;
  /** Sin fecha, el pie muestra solo el nombre: es el caso de la tarjeta del sitio. */
  fecha?: Date;
}

export async function generarTarjeta({ titulo, categoria, resumen, fecha }: DatosTarjeta): Promise<Buffer> {
  const color = categoryColor(categoria);
  const fechaTexto = fecha?.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const maqueta = {
    type: 'div',
    props: {
      style: {
        width: '1200px',
        height: '630px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        padding: '64px 72px',
        fontFamily: 'Inter',
        // Filo superior con el color de la categoría
        borderTop: `10px solid ${color}`,
      },
      children: [
        // ── Cabecera: categoría ──
        {
          type: 'div',
          props: {
            style: { display: 'flex', alignItems: 'center', gap: '14px' },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    width: '14px',
                    height: '14px',
                    borderRadius: '99px',
                    backgroundColor: color,
                  },
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: '24px',
                    fontWeight: 600,
                    color: APAGADO,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  },
                  children: categoria,
                },
              },
            ],
          },
        },

        // ── Cuerpo: título y entradilla ──
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'column', gap: '22px' },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: `${tamanoTitulo(titulo)}px`,
                    fontWeight: 700,
                    color: TEXTO,
                    lineHeight: 1.15,
                    letterSpacing: '-0.02em',
                  },
                  children: titulo,
                },
              },
              ...(resumen
                ? [{
                    type: 'div',
                    props: {
                      style: {
                        fontSize: '28px',
                        color: APAGADO,
                        lineHeight: 1.45,
                        // Dos líneas como mucho: lo demás sobra en una tarjeta
                        display: 'block',
                        lineClamp: 2,
                      },
                      children: resumen,
                    },
                  }]
                : []),
            ],
          },
        },

        // ── Pie: foto, nombre y dominio ──
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: `1px solid ${BORDE}`,
              paddingTop: '28px',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: { display: 'flex', alignItems: 'center', gap: '18px' },
                  children: [
                    {
                      type: 'img',
                      props: {
                        src: FOTO,
                        width: 64,
                        height: 64,
                        style: { borderRadius: '99px' },
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: { display: 'flex', flexDirection: 'column' },
                        children: [
                          {
                            type: 'div',
                            props: {
                              style: { fontSize: '28px', fontWeight: 600, color: TEXTO },
                              children: 'Tonny',
                            },
                          },
                          ...(fechaTexto
                            ? [{
                                type: 'div',
                                props: {
                                  style: { fontSize: '22px', color: APAGADO },
                                  children: fechaTexto,
                                },
                              }]
                            : []),
                        ],
                      },
                    },
                  ],
                },
              },
              {
                type: 'div',
                props: {
                  style: { fontSize: '24px', fontWeight: 600, color: ACENTO },
                  children: 'tonny.blog',
                },
              },
            ],
          },
        },
      ],
    },
  };

  const svg = await satori(maqueta as any, { width: 1200, height: 630, fonts: FUENTES });
  return Buffer.from(new Resvg(svg).render().asPng());
}
