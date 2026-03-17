import { Response as ExpressResponse } from 'express'
import type { ResponseOptions, ValidationErrorItem } from '~/common/types/index.js'

declare global {
  namespace Express {
    interface Response {
      ok<T>(data: T, options?: ResponseOptions | string): ExpressResponse
      created<T>(data: T, options?: ResponseOptions | string): ExpressResponse
      fail(error: string, statusCode?: number): ExpressResponse
      notFound(message?: string): ExpressResponse
      unauthorized(message?: string): ExpressResponse
      forbidden(message?: string): ExpressResponse
      validationError(errors: ValidationErrorItem[]): ExpressResponse
    }
  }
}

export {}
