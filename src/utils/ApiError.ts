import { ErrorCode, ERROR_CODES } from '../constants/errorCodes';

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly details?: unknown;

  constructor(statusCode: number, code: ErrorCode, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(msg = 'Bad Request', details?: unknown) {
    return new ApiError(400, ERROR_CODES.VALIDATION_ERROR, msg, details);
  }
  static unauthorized(msg = 'Unauthorized') {
    return new ApiError(401, ERROR_CODES.UNAUTHORIZED, msg);
  }
  static forbidden(msg = 'Forbidden', code: ErrorCode = ERROR_CODES.FORBIDDEN) {
    return new ApiError(403, code, msg);
  }
  static notFound(msg = 'Not Found') {
    return new ApiError(404, ERROR_CODES.NOT_FOUND, msg);
  }
  static conflict(msg = 'Conflict') {
    return new ApiError(409, ERROR_CODES.CONFLICT, msg);
  }
  static internal(msg = 'Internal Server Error') {
    return new ApiError(500, ERROR_CODES.INTERNAL_ERROR, msg);
  }
}