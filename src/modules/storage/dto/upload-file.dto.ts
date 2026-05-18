import { z } from 'zod/v4'

const UploadFileBodyBaseSchema = z.object({
  folderPath: z.string().optional()
})

export const UploadFileBodyExample = {
  folderPath: 'user-uploads/images'
} satisfies z.input<typeof UploadFileBodyBaseSchema>

export const UploadFileBodySchema = UploadFileBodyBaseSchema.meta({
  example: UploadFileBodyExample
})

export type UploadFileBody = z.infer<typeof UploadFileBodySchema>
