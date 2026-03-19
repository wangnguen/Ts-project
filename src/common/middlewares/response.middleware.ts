import { Request, Response, NextFunction } from 'express'
import { ReasonPhrases, StatusCodes } from 'http-status-codes'
import { ApiResponse } from '@common/utils/response.utils'
import type { SuccessPayload, ErrorPayload } from '@common/types/index'

class ResponseMiddleware {
  static extendResponse = (_req: Request, res: Response, next: NextFunction) => {
    res.ok = <T>(payload?: SuccessPayload<T>) => {
      return ResponseMiddleware.sendSuccess(res, StatusCodes.OK, ReasonPhrases.OK, payload)
    }

    res.created = <T>(payload?: SuccessPayload<T>) => {
      return ResponseMiddleware.sendSuccess(res, StatusCodes.CREATED, ReasonPhrases.CREATED, payload)
    }

    res.fail = (payload?: ErrorPayload) => {
      return ResponseMiddleware.sendError(
        res,
        payload?.statusCode || StatusCodes.BAD_REQUEST,
        ReasonPhrases.BAD_REQUEST,
        payload
      )
    }

    res.notFound = (payload?: ErrorPayload) => {
      return ResponseMiddleware.sendError(res, StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND, payload)
    }

    res.unauthorized = (payload?: ErrorPayload) => {
      return ResponseMiddleware.sendError(res, StatusCodes.UNAUTHORIZED, ReasonPhrases.UNAUTHORIZED, payload)
    }

    res.forbidden = (payload?: ErrorPayload) => {
      return ResponseMiddleware.sendError(res, StatusCodes.FORBIDDEN, ReasonPhrases.FORBIDDEN, payload)
    }

    res.validationError = (payload?: ErrorPayload) => {
      const statusCode = StatusCodes.UNPROCESSABLE_ENTITY
      return res
        .status(statusCode)
        .json(
          new ApiResponse(
            statusCode,
            payload?.message || ReasonPhrases.UNPROCESSABLE_ENTITY,
            res.req.originalUrl,
            new Date().toISOString(),
            undefined,
            undefined,
            payload?.errors
          )
        )
    }

    res.internalError = (payload?: ErrorPayload) => {
      const statusCode = StatusCodes.INTERNAL_SERVER_ERROR
      return res
        .status(statusCode)
        .json(
          new ApiResponse(
            statusCode,
            payload?.message || ReasonPhrases.INTERNAL_SERVER_ERROR,
            res.req.originalUrl,
            new Date().toISOString()
          )
        )
    }

    next()
  }

  private static sendSuccess<T>(
    res: Response,
    statusCode: number,
    defaultMessage: string,
    payload?: SuccessPayload<T>
  ) {
    return res
      .status(statusCode)
      .json(
        new ApiResponse(
          statusCode,
          payload?.message || defaultMessage,
          res.req.originalUrl,
          new Date().toISOString(),
          payload?.data,
          payload?.meta
        )
      )
  }

  private static sendError(res: Response, statusCode: number, defaultMessage: string, payload?: ErrorPayload) {
    return res
      .status(statusCode)
      .json(
        new ApiResponse(statusCode, payload?.message || defaultMessage, res.req.originalUrl, new Date().toISOString())
      )
  }
}

export default ResponseMiddleware
