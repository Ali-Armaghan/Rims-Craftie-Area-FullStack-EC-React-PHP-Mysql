import { z } from 'zod'

const userStatusSchema = z.union([
  z.literal('active'),
  z.literal('inactive'),
])
export type UserStatus = z.infer<typeof userStatusSchema>

const userSchema = z.object({
  id: z.number().or(z.string()),
  name: z.string(),
  email: z.string(),
  phone: z.string().nullable(),
  status: userStatusSchema,
  created_at: z.string().optional(),
})
export type User = z.infer<typeof userSchema>

export const userListSchema = z.array(userSchema)
