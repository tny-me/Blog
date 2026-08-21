import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { generarTarjeta } from '../../lib/tarjeta';
import { resumenDe } from '../../lib/resumen';

/** Una tarjeta por entrada, generada al compilar. */
export async function getStaticPaths() {
  const posts = await getCollection('posts', ({ data }) => !data.draft);
  return posts.map((post) => ({
    params: { slug: post.slug },
    props: { post },
  }));
}

export const GET: APIRoute = async ({ props }) => {
  const { post } = props as { post: any };
  const png = await generarTarjeta({
    titulo: post.data.title,
    categoria: post.data.category,
    resumen: resumenDe(post.body, post.data.description),
    fecha: post.data.date,
  });

  return new Response(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
