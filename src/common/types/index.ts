export interface SuccessPayload<T = unknown> {
  data?: T
  message?: string
  meta?: Record<string, unknown>
}

export interface ErrorPayload {
  message?: string
  statusCode?: number
  errors?: ValidationErrorItem[]
  stack?: string
}

export interface ValidationErrorItem {
  path: string
  message: string
}
