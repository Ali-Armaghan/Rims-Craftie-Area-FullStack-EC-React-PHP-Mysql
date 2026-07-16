import { z } from 'zod'

export const productCategorySchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string().optional(),
})

export const productColorSchema = z.object({
  name: z.string().min(1, 'Color name is required'),
  hex: z
    .string()
    .regex(/^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/, 'Invalid color'),
})

export const productSchema = z
  .object({
    id: z.number().optional(),
    name: z.string().min(1, 'Name is required'),
    slug: z.string().min(1, 'Slug is required'),
    category_ids: z.array(z.number()).min(1, 'Select at least one category'),
    category_id: z.number().optional(),
    category_name: z.string().optional(),
    category_names: z.string().optional(),
    categories: z.array(productCategorySchema).optional(),
    description: z.string().optional(),
    short_description: z.string().optional(),
    long_description: z.string().optional(),
    original_price: z.number().min(0).nullable().optional(),
    sale_price: z.number().min(0, 'Sale price must be zero or greater'),
    price: z.number().min(0).optional(),
    stock: z.number().int().min(0, 'Stock must be non-negative'),
    images: z.array(z.string()),
    colors: z.array(productColorSchema),
    is_active: z.number().int().min(0).max(1),
    created_at: z.string().optional(),
  })
  .refine(
    (data) =>
      data.original_price == null ||
      data.original_price === 0 ||
      data.sale_price <= data.original_price,
    {
      message: 'Sale price cannot be higher than original price',
      path: ['sale_price'],
    }
  )

export type ProductColor = z.infer<typeof productColorSchema>
export type Product = z.infer<typeof productSchema>
