import { Request, Response, NextFunction } from 'express'
import { ReasonPhrases, StatusCodes } from 'http-status-codes'
import type { ResponseOptions, ResponseTypeData } from '@common/types/index'
import { ApiResponse } from '@common/utils/response.utils'

class ResponseMiddleware {
  static extendResponse = (req: Request, res: Response, next: NextFunction) => {
    res.ok = <T>(data: T, options?: ResponseOptions) => {
      return ResponseMiddleware.createResponse(req, res, {
        statusCode: options?.statusCode || StatusCodes.OK,
        message: options?.message || ReasonPhrases.OK,
        data
      })
    }

    res.created = <T>(data: T, options?: ResponseOptions) => {
      return ResponseMiddleware.createResponse(req, res, {
        statusCode: options?.statusCode || StatusCodes.CREATED,
        message: options?.message || ReasonPhrases.CREATED,
        data
      })
    }

    res.fail = <T>(data: T, options?: ResponseOptions) => {
      return ResponseMiddleware.createResponse(req, res, {
        statusCode: options?.statusCode || StatusCodes.BAD_REQUEST,
        message: options?.message || ReasonPhrases.BAD_REQUEST,
        data
      })
    }

    res.notFound = <T>(data: T, options?: ResponseOptions) => {
      return ResponseMiddleware.createResponse(req, res, {
        statusCode: options?.statusCode || StatusCodes.NOT_FOUND,
        message: options?.message || ReasonPhrases.NOT_FOUND,
        data
      })
    }

    res.unauthorized = <T>(data: T, options?: ResponseOptions) => {
      return ResponseMiddleware.createResponse(req, res, {
        statusCode: options?.statusCode || StatusCodes.UNAUTHORIZED,
        message: options?.message || ReasonPhrases.UNAUTHORIZED,
        data
      })
    }

    res.forbidden = <T>(data: T, options?: ResponseOptions) => {
      return ResponseMiddleware.createResponse(req, res, {
        statusCode: options?.statusCode || StatusCodes.FORBIDDEN,
        message: options?.message || ReasonPhrases.FORBIDDEN,
        data
      })
    }

    res.validationError = <T>(data: T, options?: ResponseOptions) => {
      return ResponseMiddleware.createResponse(req, res, {
        statusCode: options?.statusCode || StatusCodes.UNPROCESSABLE_ENTITY,
        message: options?.message || ReasonPhrases.UNPROCESSABLE_ENTITY,
        data
      })
    }

    res.internalError = <T>(data: T, options?: ResponseOptions) => {
      return ResponseMiddleware.createResponse(req, res, {
        statusCode: options?.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
        message: options?.message || ReasonPhrases.INTERNAL_SERVER_ERROR,
        data
      })
    }

    next()
  }

  private static createResponse(req: Request, response: Response, options: ResponseTypeData) {
    return response
      .status(options?.statusCode || StatusCodes.OK)
      .json(
        new ApiResponse(
          options.statusCode,
          options.message,
          options.data,
          options.meta,
          req.originalUrl,
          new Date().toISOString()
        )
      )
  }
}

export default ResponseMiddleware
