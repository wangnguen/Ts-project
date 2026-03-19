import type { ValidationErrorItem } from '@common/types/index'

export class ApiResponse {
  constructor(
    public statusCode: number,
    public message: string,
    public path: string,
    public timestamp: string,
    public data?: unknown,
    public meta?: Record<string, unknown>,
    public errors?: ValidationErrorItem[]
  ) {}
}
