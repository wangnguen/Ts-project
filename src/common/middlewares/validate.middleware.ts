import { Request, Response, NextFunction } from 'express'
import { z } from 'zod/v4'
import { ValidationError } from '~/common/errors/app.error.js'
import type { ValidationErrorItem } from '~/common/types/index.js'

interface ValidationSchema {
  body?: z.ZodType
  params?: z.ZodType
  query?: z.ZodType
}

export const validate = (schema: ValidationSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const errors: ValidationErrorItem[] = []

    for (const [key, zodSchema] of Object.entries(schema)) {
      if (!zodSchema) continue

      const result = zodSchema.safeParse(req[key as keyof typeof schema])

      if (!result.success) {
        for (const issue of result.error.issues) {
          errors.push({
            path: issue.path.length ? `${key}.${issue.path.join('.')}` : key,
            message: issue.message
          })
        }
      }
    }

    if (errors.length > 0) {
      throw new ValidationError(errors)
    }

    next()
  }
}
