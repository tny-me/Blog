import { Node, mergeAttributes } from '@tiptap/core';

/**
 * Bloques propios del editor.
 *
 * Las entradas se guardan en Markdown, así que estos bloques viajan como HTML
 * incrustado dentro del archivo. Astro renderiza HTML dentro de Markdown, y las
 * reglas de conversión del editor los devuelven tal cual, sin desarmarlos.
 */

export type TipoDestacado = 'nota' | 'idea' | 'aviso';

/** Recuadro con icono para notas, ideas y advertencias. */
export const Destacado = Node.create({
  name: 'destacado',
  group: 'block',
  content: 'block+',
  defining: true,

  addAttributes() {
    return {
      tipo: {
        default: 'nota' as TipoDestacado,
        parseHTML: (el) => el.getAttribute('data-tipo') ?? 'nota',
        renderHTML: (attrs) => ({ 'data-tipo': attrs.tipo }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'aside.destacado' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['aside', mergeAttributes(HTMLAttributes, { class: 'destacado' }), 0];
  },

  addCommands() {
    return {
      ponerDestacado:
        (tipo: TipoDestacado) =>
        ({ editor, commands }: any) =>
          // Estando ya dentro de uno, se cambia su tipo en vez de anidar otro.
          editor.isActive(this.name)
            ? commands.updateAttributes(this.name, { tipo })
            : commands.wrapIn(this.name, { tipo }),
    } as any;
  },

  addKeyboardShortcuts() {
    return {
      // Intro en un parrafo vacio al final del recuadro sale de el, que es la
      // unica forma comoda de seguir escribiendo debajo.
      Enter: () => {
        const { $from, empty } = this.editor.state.selection;
        if (!empty) return false;

        const contenedor = $from.node(-1);
        if (contenedor?.type.name !== this.name) return false;
        if ($from.parent.type.name !== 'paragraph' || $from.parent.content.size !== 0) return false;
        if ($from.index(-1) !== contenedor.childCount - 1) return false;

        return this.editor.commands.lift(this.name);
      },
    };
  },
});

/**
 * Imágenes recién subidas, mientras el sitio aún no las publica.
 *
 * Al subir una imagen, el archivo entra al repositorio al instante, pero su
 * dirección en el sitio no responde hasta el siguiente despliegue. Para que el
 * autor la vea de inmediato se guarda aquí una copia local, asociada a la
 * dirección definitiva; el archivo guardado siempre lleva la dirección buena.
 */
export const vistasLocales = new Map<string, string>();

/** Imagen con pie de foto. El pie es el contenido editable del nodo. */
export const Figura = Node.create({
  name: 'figura',
  group: 'block',
  content: 'inline*',
  draggable: true,
  isolating: true,

  addAttributes() {
    return {
      src: { default: '' },
      alt: { default: '' },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'figure',
        contentElement: 'figcaption',
        getAttrs: (el) => {
          const img = (el as HTMLElement).querySelector('img');
          if (!img) return false;
          return { src: img.getAttribute('src') ?? '', alt: img.getAttribute('alt') ?? '' };
        },
      },
    ];
  },

  renderHTML({ node }) {
    return [
      'figure',
      { class: 'figura' },
      ['img', { src: node.attrs.src, alt: node.attrs.alt, loading: 'lazy' }],
      ['figcaption', 0],
    ];
  },

  /**
   * Se dibuja a mano para poder mostrar la copia local sin que eso afecte a lo
   * que se guarda: la vista es cosa del editor, el atributo sigue intacto.
   */
  addNodeView() {
    return ({ node }: any) => {
      const figura = document.createElement('figure');
      figura.className = 'figura';

      const img = document.createElement('img');
      const pie = document.createElement('figcaption');

      const pintar = (n: any) => {
        img.src = vistasLocales.get(n.attrs.src) ?? n.attrs.src;
        img.alt = n.attrs.alt ?? '';
        figura.classList.remove('sin-publicar');
      };
      // Sin copia local y sin publicar todavia: se avisa en vez de dejar el
      // hueco roto, que es lo que confunde.
      img.addEventListener('error', () => figura.classList.add('sin-publicar'));

      pintar(node);
      figura.append(img, pie);

      return {
        dom: figura,
        contentDOM: pie,
        update: (n: any) => {
          if (n.type.name !== 'figura') return false;
          pintar(n);
          return true;
        },
      };
    };
  },

  addCommands() {
    return {
      ponerFigura:
        (attrs: { src: string; alt?: string; pie?: string }) =>
        ({ chain }: any) =>
          chain()
            .insertContent([
              {
                type: this.name,
                attrs: { src: attrs.src, alt: attrs.alt ?? '' },
                content: attrs.pie ? [{ type: 'text', text: attrs.pie }] : undefined,
              },
              { type: 'paragraph' },
            ])
            .run(),
    } as any;
  },
});

/** Vídeo incrustado, en un envoltorio que mantiene la proporción. */
export const Video = Node.create({
  name: 'video',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return { src: { default: '' } };
  },

  addCommands() {
    return {
      ponerVideo:
        (src: string) =>
        ({ chain }: any) =>
          chain()
            .insertContent([{ type: this.name, attrs: { src } }, { type: 'paragraph' }])
            .run(),
    } as any;
  },

  parseHTML() {
    return [
      {
        tag: 'div.video',
        getAttrs: (el) => {
          const marco = (el as HTMLElement).querySelector('iframe');
          return marco ? { src: marco.getAttribute('src') ?? '' } : false;
        },
      },
    ];
  },

  renderHTML({ node }) {
    return [
      'div',
      { class: 'video' },
      [
        'iframe',
        {
          src: node.attrs.src,
          loading: 'lazy',
          frameborder: '0',
          allow: 'accelerometer; clipboard-write; encrypted-media; picture-in-picture',
          allowfullscreen: 'true',
        },
      ],
    ];
  },
});

/**
 * Convierte la dirección que pega el autor en una apta para incrustar.
 * Devuelve null si no se reconoce el servicio, para poder avisarle.
 */
export function urlDeVideo(entrada: string): string | null {
  const url = entrada.trim();
  const youtube = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/.exec(url);
  if (youtube) return `https://www.youtube.com/embed/${youtube[1]}`;
  const vimeo = /vimeo\.com\/(?:video\/)?(\d+)/.exec(url);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
}

/** Plantillas de partida para los diagramas. */
export const PLANTILLA_MAPA = `mindmap
  root((Tema central))
    Primera rama
      Detalle
      Otro detalle
    Segunda rama
      Detalle`;

export const PLANTILLA_FLUJO = `flowchart TD
  A[Inicio] --> B{¿Se cumple?}
  B -- Sí --> C[Resultado]
  B -- No --> D[Alternativa]`;
