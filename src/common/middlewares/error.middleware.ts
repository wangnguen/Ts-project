import { NextFunction, Request, Response } from 'express'
import { z } from 'zod/v4'
import { AppError, ValidationError } from '~/common/errors/app.error.js'
import env from '~/common/config/env.js'

const notFound = (req: Request, res: Response) => {
  res.notFound(`Route ${req.originalUrl} not found`)
}

const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof z.ZodError) {
    return res.validationError(
      err.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message
      }))
    )
  }

  if (err instanceof ValidationError) {
    return res.validationError(err.errors)
  }

  if (err instanceof AppError) {
    return res.fail(err.message, err.statusCode)
  }

  console.error(err.stack)
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    ...(env.NODE_ENV === 'development' && {
      message: err.message,
      stack: err.stack
    })
  })
}

export { notFound, errorHandler }
