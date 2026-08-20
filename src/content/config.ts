import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string().optional(),
    image: z.string().optional(),
    /** Categoría libre: la que se escriba aquí aparece sola en la barra lateral. */
    category: z.string().default('General'),
    type: z.enum(['reflexion', 'carta', 'fe', 'espiritu', 'general']).default('general'),
    draft: z.boolean().default(false),
    tags: z.array(z.string()).optional(),
  }),
});

export const collections = { posts };
