import { z } from 'zod/v4'

import { passwordSchema } from '@common/validators'

export const UpdateUserPasswordBodySchema = z
  .object({
    currentPassword: passwordSchema,
    newPassword: passwordSchema,
    confirmPassword: z.string()
  })
  .refine((data) => data.confirmPassword === data.newPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  })

export type UpdateUserPasswordBody = Omit<z.infer<typeof UpdateUserPasswordBodySchema>, 'confirmPassword'>
