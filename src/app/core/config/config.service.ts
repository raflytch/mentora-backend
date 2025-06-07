import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class ConfigService {
  constructor(private readonly nestConfigService: NestConfigService) {}

  get databaseUrl(): string {
    return this.nestConfigService.get<string>('DATABASE_URL') || '';
  }

  get port(): number {
    return this.nestConfigService.get<number>('PORT') || 3000;
  }

  get nodeEnv(): string {
    return this.nestConfigService.get<string>('NODE_ENV') || 'development';
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  get jwtSecret(): string {
    return this.nestConfigService.get<string>('JWT_SECRET') || 'default-secret';
  }

  get cloudinaryCloudName(): string {
    return this.nestConfigService.get<string>('CLOUDINARY_CLOUD_NAME') || '';
  }

  get cloudinaryApiKey(): string {
    return this.nestConfigService.get<string>('CLOUDINARY_API_KEY') || '';
  }

  get cloudinaryApiSecret(): string {
    return this.nestConfigService.get<string>('CLOUDINARY_API_SECRET') || '';
  }
}
