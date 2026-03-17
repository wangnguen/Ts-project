export interface ResponseOptions {
  message?: string
  meta?: Record<string, unknown>
}

export interface ValidationErrorItem {
  path: string
  message: string
}
