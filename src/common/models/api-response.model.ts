import { SuccessData, ValidationErrorItem } from '@common/types'

export class ApiSuccessResponse<T> {
  constructor(
    public statusCode: number,
    public message: string,
    public data: SuccessData<T>,
    public path: string,
    public timestamp: string
  ) {}
}

export class ApiErrorResponse {
  constructor(
    public statusCode: number,
    public message: string,
    public path: string,
    public timestamp: string,
    public errors?: ValidationErrorItem[]
  ) {}
}
