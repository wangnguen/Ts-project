import { z } from 'zod/v4'

export const LoginBodySchema = z.object({
  email: z.email(),
  password: z.string().min(8)
})

export type LoginBody = z.infer<typeof LoginBodySchema>
