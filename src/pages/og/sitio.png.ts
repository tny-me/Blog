import type { APIRoute } from 'astro';
import { generarTarjeta } from '../../lib/tarjeta';

/** Tarjeta de reserva: la que se ve al compartir la portada o Acerca. */
export const GET: APIRoute = async () => {
  const png = await generarTarjeta({
    titulo: 'Apuntes sobre sistemas, datos y operaciones',
    categoria: 'tonny.blog',
    resumen: 'Hola, soy Tonny y estos son mis apuntes.',
  });

  return new Response(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
