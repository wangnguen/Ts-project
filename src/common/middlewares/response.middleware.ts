import { Request, Response, NextFunction, Response as ExpressResponse } from 'express'
import type { ResponseOptions, ValidationErrorItem } from '~/common/types/index.js'

export const extendResponse = (_req: Request, res: Response, next: NextFunction) => {
  res.ok = <T>(data: T, options?: ResponseOptions | string): ExpressResponse => {
    const opts: ResponseOptions | undefined = typeof options === 'string' ? { message: options } : options
    return res.status(200).json({ success: true, ...opts, data })
  }

  res.created = <T>(data: T, options?: ResponseOptions | string): ExpressResponse => {
    const opts: ResponseOptions | undefined = typeof options === 'string' ? { message: options } : options
    return res.status(201).json({ success: true, ...opts, data })
  }

  res.fail = (error: string, statusCode: number = 400): ExpressResponse => {
    return res.status(statusCode).json({ success: false, error })
  }

  res.notFound = (message: string = 'Not Found'): ExpressResponse => {
    return res.status(404).json({ success: false, error: message })
  }

  res.unauthorized = (message: string = 'Unauthorized'): ExpressResponse => {
    return res.status(401).json({ success: false, error: message })
  }

  res.forbidden = (message: string = 'Forbidden'): ExpressResponse => {
    return res.status(403).json({ success: false, error: message })
  }

  res.validationError = (errors: ValidationErrorItem[]): ExpressResponse => {
    return res.status(422).json({ success: false, error: 'Validation Error', errors })
  }

  next()
}
