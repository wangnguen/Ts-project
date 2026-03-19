import { Response as ExpressResponse } from 'express'
import type { SuccessPayload, ErrorPayload } from '@common/types/index'

declare global {
  namespace Express {
    interface Response {
      ok<T>(payload?: SuccessPayload<T>): ExpressResponse
      created<T>(payload?: SuccessPayload<T>): ExpressResponse
      fail(payload?: ErrorPayload): ExpressResponse
      notFound(payload?: ErrorPayload): ExpressResponse
      unauthorized(payload?: ErrorPayload): ExpressResponse
      forbidden(payload?: ErrorPayload): ExpressResponse
      validationError(payload?: ErrorPayload): ExpressResponse
      internalError(payload?: ErrorPayload): ExpressResponse
    }
  }
}

export {}
