export interface ResponseOptions {
  message?: string
  meta?: Record<string, unknown>
  statusCode?: number
}

export interface ValidationErrorItem {
  path: string
  message: string
}

export interface ResponseTypeData extends Required<Pick<ResponseOptions, 'statusCode'>> {
  message: string
  data?: unknown
  meta?: Record<string, unknown>
}
