import { z } from 'zod/v4'

import { TOKEN_LENGTH } from '@common/constants'
import { passwordSchema } from '@common/validators'

export const ResetPasswordBodySchema = z
  .object({
    token: z.string().length(TOKEN_LENGTH),
    password: passwordSchema,
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  })

export type ResetPasswordBody = z.infer<typeof ResetPasswordBodySchema>
