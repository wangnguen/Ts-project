import { z } from 'zod/v4'

const RenameFileBodyBaseSchema = z.object({
  folderPath: z.string().optional(),
  oldFileName: z.string().min(1),
  newFileName: z.string().min(1)
})

export const RenameFileBodyExample = {
  folderPath: 'user-uploads/images',
  oldFileName: 'old-image.jpg',
  newFileName: 'new-image.jpg'
} satisfies z.input<typeof RenameFileBodyBaseSchema>

export const RenameFileBodySchema = RenameFileBodyBaseSchema.meta({
  example: RenameFileBodyExample
})

export type RenameFileBody = z.infer<typeof RenameFileBodySchema>
