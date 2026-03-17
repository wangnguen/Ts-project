export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public isOperational = true
  ) {
    super(message)
    Error.captureStackTrace(this, this.constructor)
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad Request') {
    super(400, message)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(401, message)
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(403, message)
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Not Found') {
    super(404, message)
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict') {
    super(409, message)
  }
}

export class ValidationError extends AppError {
  constructor(public errors: { path: string; message: string }[]) {
    super(422, 'Validation Error')
  }
}
