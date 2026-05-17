import { z } from 'zod/v4'

const DeleteFolderBodyBaseSchema = z.object({
  folderPath: z.string().min(1)
})

export const DeleteFolderBodyExample = {
  folderPath: 'user-uploads/images'
} satisfies z.input<typeof DeleteFolderBodyBaseSchema>

export const DeleteFolderBodySchema = DeleteFolderBodyBaseSchema.meta({
  example: DeleteFolderBodyExample
})

export type DeleteFolderBody = z.infer<typeof DeleteFolderBodySchema>
