import { z } from 'zod/v4'

const LoginBodyBaseSchema = z.discriminatedUnion('step', [
  z.object({
    step: z.literal('password'),
    email: z.email(),
    password: z.string().min(8)
  }),
  z.object({
    step: z.literal('2fa'),
    pendingToken: z.string().min(1),
    code: z
      .string()
      .length(6)
      .regex(/^\d{6}$/)
  })
])

export const LoginBodyExample = {
  step: 'password',
  email: 'kimnguen79lc@gmail.com',
  password: 'Abc123!@#'
} satisfies z.input<typeof LoginBodyBaseSchema>

export const LoginBodyTwoFactorExample = {
  step: '2fa' as const,
  pendingToken: 'a3f8d2c1e4b57f9a...',
  code: '123456'
} satisfies z.input<typeof LoginBodyBaseSchema>

export const LoginBodySchema = LoginBodyBaseSchema.meta({ example: LoginBodyExample })

export type LoginBody = z.infer<typeof LoginBodySchema>
