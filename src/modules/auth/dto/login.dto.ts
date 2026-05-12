import { z } from 'zod/v4'

export const LoginBodySchema = z.discriminatedUnion('step', [
  z.object({
    step: z.literal('password'),
    email: z.email().meta({ example: 'kimnguen79lc@gmail.com' }),
    password: z.string().min(8).meta({ example: 'Abc123!@#' })
  }),
  z.object({
    step: z.literal('2fa'),
    pendingToken: z.string().min(1).meta({ example: 'a3f8d2c1e4b57f9a...' }),
    code: z
      .string()
      .length(6)
      .regex(/^\d{6}$/)
      .meta({ example: '123456' })
  })
])

export type LoginBody = z.infer<typeof LoginBodySchema>
