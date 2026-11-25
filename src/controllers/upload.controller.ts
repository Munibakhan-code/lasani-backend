import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { created, ok } from '../utils/ApiResponse';
import { cloudinaryService } from '../services/cloudinary.service';
import { ApiError } from '../utils/ApiError';

export const uploadController = {
  uploadImage: asyncHandler(async (req: Request, res: Response) => {
    const file = req.file;
    if (!file) throw ApiError.badRequest('Image file is required');
    const folder = req.body?.folder ? String(req.body.folder) : undefined;
    const result = await cloudinaryService.uploadImage(file.buffer, folder);
    return created(res, { url: result.url, publicId: result.publicId });
  }),

  deleteImage: asyncHandler(async (req: Request, res: Response) => {
    const { publicId } = req.body;
    if (!publicId) throw ApiError.badRequest('publicId is required');
    await cloudinaryService.deleteImage(publicId);
    return ok(res, { ok: true });
  }),
};