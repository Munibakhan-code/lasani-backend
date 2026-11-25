import { Request } from 'express';
import { ApiError } from './ApiError';

/** Safely extract a single string param from req.params / req.query. */
export function getParam(value: unknown, name: string): string {
  if (typeof value === 'string' && value.length > 0) return value;
  if (Array.isArray(value) && typeof value[0] === 'string' && value[0].length > 0) {
    return value[0];
  }
  throw ApiError.badRequest(`Missing or invalid parameter: ${name}`);
}

export function getOptionalParam(value: unknown): string | undefined {
  if (typeof value === 'string' && value.length > 0) return value;
  if (Array.isArray(value) && typeof value[0] === 'string' && value[0].length > 0) {
    return value[0];
  }
  return undefined;
}

export function getStringParam(req: Request, key: string): string {
  return getParam(req.params?.[key] ?? req.query?.[key], key);
}

export function getOptionalStringParam(req: Request, key: string): string | undefined {
  return getOptionalParam(req.params?.[key] ?? req.query?.[key]);
}

export function getPagination(req: Request): { page: number; limit: number } {
  const pageRaw = getOptionalParam(req.query.page);
  const limitRaw = getOptionalParam(req.query.limit);
  const page = pageRaw ? Math.max(1, parseInt(pageRaw, 10) || 1) : 1;
  const limit = limitRaw ? Math.min(100, Math.max(1, parseInt(limitRaw, 10) || 20)) : 20;
  return { page, limit };
}