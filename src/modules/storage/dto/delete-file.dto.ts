import { z } from 'zod/v4'

const DeleteFileBodyBaseSchema = z.object({
  folderPath: z.string().optional(),
  fileName: z.string().min(1)
})

export const DeleteFileBodyExample = {
  folderPath: 'user-uploads/images',
  fileName: 'image.jpg'
} satisfies z.input<typeof DeleteFileBodyBaseSchema>

export const DeleteFileBodySchema = DeleteFileBodyBaseSchema.meta({
  example: DeleteFileBodyExample
})

export type DeleteFileBody = z.infer<typeof DeleteFileBodySchema>
