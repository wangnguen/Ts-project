import { z } from 'zod/v4'

export const UpdateUserPasswordBodySchema = z.object({
  currentPassword: z.string().min(6).max(100),
  newPassword: z.string().min(6).max(100)
})

export type UpdateUserPasswordBody = z.infer<typeof UpdateUserPasswordBodySchema>
