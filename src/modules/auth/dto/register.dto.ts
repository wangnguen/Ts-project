import { passwordSchema } from '@common/validators'
import { z } from 'zod/v4'

export const RegisterBodySchema = z
  .object({
    username: z.string().min(3).max(30),
    email: z.email(),
    password: passwordSchema,
    confirmPassword: z.string(),
    fullName: z.string().min(1).max(255)
  })
  .refine((data) => data.confirmPassword === data.password, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  })

export type RegisterBody = z.infer<typeof RegisterBodySchema>
