import { z } from 'zod/v4'

const passwordSchema = z
  .string()
  .min(8)
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/,
    'Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one number, and one special character'
  )

export const UuidParamSchema = z.object({
  id: z.uuid()
})

export type UuidParam = z.infer<typeof UuidParamSchema>

export const CreateUserBodySchema = z.object({
  username: z.string().min(3).max(30),
  email: z.email(),
  password: passwordSchema
})

export type CreateUserBody = z.infer<typeof CreateUserBodySchema>

export const UpdateUserBodySchema = z
  .object({
    username: z.string().min(3).max(30).optional(),
    email: z.email().optional(),
    password: passwordSchema.optional()
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided'
  })

export type UpdateUserBody = z.infer<typeof UpdateUserBodySchema>
