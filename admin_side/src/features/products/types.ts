import { z } from 'zod'

export const productCategorySchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string().optional(),
})

export const productSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  category_ids: z.array(z.number()).min(1, 'Select at least one category'),
  category_id: z.number().optional(),
  category_name: z.string().optional(),
  category_names: z.string().optional(),
  categories: z.array(productCategorySchema).optional(),
  description: z.string().optional(),
  price: z.number().min(0, 'Price must be positive'),
  stock: z.number().int().min(0, 'Stock must be non-negative'),
  images: z.array(z.string()),
  is_active: z.number().int().min(0).max(1),
  created_at: z.string().optional(),
})

export type Product = z.infer<typeof productSchema>
