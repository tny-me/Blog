import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { prepararCarrusel, generarLamina } from '../../../lib/carrusel';

/** Una imagen por lámina y por entrada, generadas al compilar. */
export async function getStaticPaths() {
  const posts = await getCollection('posts', ({ data }) => !data.draft);
  return posts.flatMap((post) => {
    const carrusel = prepararCarrusel(post.body);
    return Array.from({ length: carrusel.total }, (_, i) => ({
      params: { imagen: `${post.slug}-${i + 1}` },
      props: { post, carrusel, numero: i + 1 },
    }));
  });
}

export const GET: APIRoute = async ({ props, site }) => {
  const { post, carrusel, numero } = props as any;
  const png = await generarLamina(
    {
      titulo: post.data.title,
      categoria: post.data.category,
      fecha: post.data.date,
      enlace: new URL(`/posts/${post.slug}/`, site).href,
      cuerpo: post.body,
    },
    carrusel,
    numero,
  );

  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=3600' },
  });
};
