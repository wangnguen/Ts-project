import { z } from 'zod/v4'

const CreateFolderBodyBaseSchema = z.object({
  folderName: z.string().min(1),
  folderPath: z.string().min(1)
})

export const CreateFolderBodyExample = {
  folderName: 'new-folder',
  folderPath: 'user-uploads/images'
} satisfies z.input<typeof CreateFolderBodyBaseSchema>

export const CreateFolderBodySchema = CreateFolderBodyBaseSchema.meta({
  example: CreateFolderBodyExample
})

export type CreateFolderBody = z.infer<typeof CreateFolderBodySchema>
