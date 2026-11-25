import streamifier from 'streamifier'; // add to package.json if you use it
import { cloudinary } from '../config/cloudinary';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';

export const cloudinaryService = {
  async uploadImage(buffer: Buffer, folder?: string) {
    if (!env.CLOUDINARY_CLOUD_NAME) {
      throw ApiError.internal('Cloudinary is not configured');
    }
    return new Promise<{ url: string; publicId: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: folder ?? env.CLOUDINARY_FOLDER, resource_type: 'image' },
        (err, result) => {
          if (err || !result) return reject(err ?? new Error('Upload failed'));
          resolve({ url: result.secure_url, publicId: result.public_id });
        }
      );
      streamifier.createReadStream(buffer).pipe(stream);
    });
  },

  async deleteImage(publicId: string) {
    if (!publicId) return;
    await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
  },
};