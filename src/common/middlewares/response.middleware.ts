import { Request, Response, NextFunction, Response as ExpressResponse } from 'express'
import { StatusCodes, ReasonPhrases } from 'http-status-codes'
import type { ResponseOptions, ValidationErrorItem } from '@common/types/index.js'

class ResponseMiddleware {
  static extendResponse = (_req: Request, res: Response, next: NextFunction) => {
    res.ok = <T>(data: T, options?: ResponseOptions | string): ExpressResponse => {
      const opts: ResponseOptions | undefined = typeof options === 'string' ? { message: options } : options
      return res.status(StatusCodes.OK).json({ success: true, ...opts, data })
    }

    res.created = <T>(data: T, options?: ResponseOptions | string): ExpressResponse => {
      const opts: ResponseOptions | undefined = typeof options === 'string' ? { message: options } : options
      return res.status(StatusCodes.CREATED).json({ success: true, ...opts, data })
    }

    res.fail = (error: string, statusCode: number = StatusCodes.BAD_REQUEST): ExpressResponse => {
      return res.status(statusCode).json({ success: false, error })
    }

    res.notFound = (message: string = ReasonPhrases.NOT_FOUND): ExpressResponse => {
      return res.status(StatusCodes.NOT_FOUND).json({ success: false, error: message })
    }

    res.unauthorized = (message: string = ReasonPhrases.UNAUTHORIZED): ExpressResponse => {
      return res.status(StatusCodes.UNAUTHORIZED).json({ success: false, error: message })
    }

    res.forbidden = (message: string = ReasonPhrases.FORBIDDEN): ExpressResponse => {
      return res.status(StatusCodes.FORBIDDEN).json({ success: false, error: message })
    }

    res.validationError = (errors: ValidationErrorItem[]): ExpressResponse => {
      return res
        .status(StatusCodes.UNPROCESSABLE_ENTITY)
        .json({ success: false, error: ReasonPhrases.UNPROCESSABLE_ENTITY, errors })
    }

    res.internalError = (
      error: string = ReasonPhrases.INTERNAL_SERVER_ERROR,
      details?: { message?: string; stack?: string }
    ): ExpressResponse => {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        error,
        ...details
      })
    }

    next()
  }
}

export default ResponseMiddleware
