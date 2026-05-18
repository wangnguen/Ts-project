import { z } from 'zod/v4'

const listFolderQueryBaseSchema = z.object({
  folderPath: z.string().min(1)
})

export const ListFolderQueryExample = {
  folderPath: 'user-uploads/images'
} satisfies z.input<typeof listFolderQueryBaseSchema>

export const ListFolderQuerySchema = listFolderQueryBaseSchema.meta({
  example: ListFolderQueryExample
})

export type ListFolderQuery = z.infer<typeof ListFolderQuerySchema>
