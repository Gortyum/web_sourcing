import { defineCollection, z } from 'astro:content';

const products = defineCollection({
  type: 'data',
  schema: z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    description: z.string(),
    sku: z.string(),
    category: z.string(),
    material: z.string(),
    moq: z.string(),
    customization: z.string(),
    origin: z.string(),
    name_pt: z.string().optional(),
    description_pt: z.string().optional(),
    category_pt: z.string().optional(),
    material_pt: z.string().optional(),
    customization_pt: z.string().optional(),
    origin_pt: z.string().optional(),
    art: z.enum(['bottle', 'tote', 'notebook', 'mug', 'cap', 'kit']),
    featured: z.boolean().default(true),
    active: z.boolean().default(true),
    display_order: z.number(),
  }),
});

export const collections = { products };