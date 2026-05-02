import { z } from 'zod/v4'

export const successWrapper = <T extends z.ZodTypeAny>(dataSchema: T, pathExample: string) =>
  z.object({
    statusCode: z.number().openapi({ example: 200 }),
    message: z.string().openapi({ example: 'OK' }),
    data: dataSchema,
    path: z.string().openapi({ example: pathExample }),
    timestamp: z.string().datetime().openapi({ example: '2024-01-15T10:30:00.000Z' })
  })

export const ErrorResponseSchema = z.object({
  statusCode: z.number().openapi({ example: 400 }),
  message: z.string().openapi({ example: 'Bad Request' }),
  path: z.string().openapi({ example: '/api/v1/...' }),
  timestamp: z.string().datetime().openapi({ example: '2024-01-15T10:30:00.000Z' })
})

export const errorResponse = (statusCode: number, description: string, message: string) => ({
  description,
  content: {
    'application/json': {
      schema: ErrorResponseSchema.openapi({
        example: { statusCode, message, path: '/api/v1/...', timestamp: '2024-01-15T10:30:00.000Z' }
      })
    }
  }
})
