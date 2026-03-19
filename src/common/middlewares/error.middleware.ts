import { NextFunction, Request, Response } from 'express'
import { ReasonPhrases } from 'http-status-codes'
import { AppError, ValidationError } from '@common/errors/app.error'
import env from '@common/config/env'

class ErrorMiddleware {
  static notFound(req: Request, res: Response) {
    res.notFound({ error: `Route ${req.originalUrl} not found` })
  }

  static errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
    if (err instanceof ValidationError) {
      return res.validationError(err.errors)
    }

    if (err instanceof AppError) {
      return res.fail({ error: err.message }, { statusCode: err.statusCode })
    }

    console.error(err.stack)
    res.internalError({
      error: ReasonPhrases.INTERNAL_SERVER_ERROR,
      ...(env.NODE_ENV === 'development' && { message: err.message, stack: err.stack })
    })
  }
}

export default ErrorMiddleware
