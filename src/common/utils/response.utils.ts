export class ApiResponse {
  constructor(
    public statusCode: number,
    public message?: string,
    public data?: unknown,
    public meta?: Record<string, unknown>,
    public path?: string,
    public timestamp?: string
  ) {}
}
