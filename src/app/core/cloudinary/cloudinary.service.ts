import { Injectable, Inject } from '@nestjs/common';
import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiErrorResponse,
} from 'cloudinary';
import { ConfigService } from '../config/config.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class CloudinaryService {
  constructor(
    private readonly configService: ConfigService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {
    cloudinary.config({
      cloud_name: this.configService.cloudinaryCloudName,
      api_key: this.configService.cloudinaryApiKey,
      api_secret: this.configService.cloudinaryApiSecret,
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    folder?: string,
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadOptions = {
        folder: folder || 'mentora',
        resource_type: 'auto' as const,
        transformation: [
          { width: 1000, height: 1000, crop: 'limit' },
          { quality: 'auto' },
          { format: 'auto' },
        ],
      };

      cloudinary.uploader
        .upload_stream(
          uploadOptions,
          (
            error: UploadApiErrorResponse | undefined,
            result: UploadApiResponse | undefined,
          ) => {
            if (error) {
              this.logger.error('Cloudinary upload error', {
                error,
                context: 'CloudinaryService',
              });
              reject(error);
            } else if (result) {
              this.logger.info('File uploaded successfully', {
                publicId: result.public_id,
                context: 'CloudinaryService',
              });
              resolve(result);
            }
          },
        )
        .end(file.buffer);
    });
  }

  async deleteFile(publicId: string): Promise<any> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      this.logger.info('File deleted successfully', {
        publicId,
        result,
        context: 'CloudinaryService',
      });
      return result;
    } catch (error) {
      this.logger.error('Cloudinary delete error', {
        error,
        publicId,
        context: 'CloudinaryService',
      });
      throw error;
    }
  }

  async uploadMultipleFiles(
    files: Express.Multer.File[],
    folder?: string,
  ): Promise<UploadApiResponse[]> {
    const uploadPromises = files.map((file) => this.uploadFile(file, folder));
    return Promise.all(uploadPromises);
  }

  generateUrl(publicId: string, transformations?: any): string {
    return cloudinary.url(publicId, transformations);
  }
}
