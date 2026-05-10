import { z } from 'zod/v4'

const LoginBodyBaseSchema = z.object({
  email: z.email(),
  password: z.string().min(8)
})

export const LoginBodyExample = {
  email: 'kimnguen79lc@gmail.com',
  password: 'Abc123!@#'
} satisfies z.input<typeof LoginBodyBaseSchema>

export const LoginBodySchema = LoginBodyBaseSchema.meta({
  example: LoginBodyExample
})

export type LoginBody = z.infer<typeof LoginBodySchema>
