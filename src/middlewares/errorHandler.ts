// src/middlewares/errorHandler.ts
import { ErrorRequestHandler } from 'express';
import { ApiError } from '../utils/ApiError';
import { ERROR_CODES } from '../constants/errorCodes';
import { logger } from '../config/logger';
import { env } from '../config/env';

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  let statusCode = 500;
  let code: string = ERROR_CODES.INTERNAL_ERROR;
  let message = 'Internal Server Error';
  let details: unknown;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
    details = err.details;
  } else if (err?.name === 'ValidationError') {
    statusCode = 400;
    code = ERROR_CODES.VALIDATION_ERROR;
    message = err.message;
  } else if (err?.name === 'CastError') {
    statusCode = 400;
    code = ERROR_CODES.VALIDATION_ERROR;
    message = 'Invalid identifier';
  } else if (err?.code === 11000) {
    statusCode = 409;
    code = ERROR_CODES.CONFLICT;
    message = 'Duplicate value';
  }

  if (statusCode >= 500) {
    logger.error({ err, path: req.originalUrl, method: req.method }, 'Unhandled error');
  }

  res.status(statusCode).json({
    success: false,
    message,
    code,
    ...(details ? { details } : {}),
    ...(env.isProd || !err?.stack ? {} : { stack: err.stack }),
  });
};