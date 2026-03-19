import { UserRole } from '@databases/entities/user.entity'
import { z } from 'zod/v4'

export const CreateUserBodySchema = z.object({
  username: z.string().min(3).max(30),
  email: z.email(),
  password: z
    .string()
    .min(8)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/,
      'Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one number, and one special character'
    ),
  role: z.nativeEnum(UserRole).default(UserRole.USER)
})

export type CreateUserBody = z.infer<typeof CreateUserBodySchema>

export const UpdateUserBodySchema = z
  .object({
    username: z.string().min(3).max(30).optional(),
    email: z.email().optional(),
    password: z
      .string()
      .min(8)
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/,
        'Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one number, and one special character'
      )
      .optional(),
    role: z.nativeEnum(UserRole).optional()
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided'
  })

export type UpdateUserBody = z.infer<typeof UpdateUserBodySchema>
