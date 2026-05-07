import { z } from 'zod/v4'

import { TOKEN_LENGTH } from '@common/constants/auth.constant'

export const VerifyEmailBodySchema = z.object({
  token: z.string().length(TOKEN_LENGTH)
})

export type VerifyEmailBody = z.infer<typeof VerifyEmailBodySchema>
