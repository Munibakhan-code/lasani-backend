import { RequestHandler } from 'express';
import { ZodTypeAny, ZodError } from 'zod';
import { ApiError } from '../utils/ApiError';
import { ERROR_CODES } from '../constants/errorCodes';

type Schemas = {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
};

export const validate =
  (schemas: Schemas): RequestHandler =>
  (req, _res, next) => {
    try {
      if (schemas.body) req.body = schemas.body.parse(req.body);
      if (schemas.query) req.query = schemas.query.parse(req.query) as any;
      if (schemas.params) req.params = schemas.params.parse(req.params) as any;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const details = err.errors.map((e) => ({ path: e.path.join('.'), message: e.message }));
        return next(
          new ApiError(400, ERROR_CODES.VALIDATION_ERROR, 'Validation failed', details)
        );
      }
      next(err);
    }
  };