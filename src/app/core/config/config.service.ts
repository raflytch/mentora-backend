import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class ConfigService {
  constructor(private configService: NestConfigService) {}

  get port(): number {
    return this.configService.get<number>('PORT') || 3000;
  }

  get nodeEnv(): string {
    return this.configService.get<string>('NODE_ENV') || 'development';
  }

  get jwtSecret(): string {
    return this.configService.get<string>('JWT_SECRET') || 'secret';
  }

  get jwtExpiresIn(): string {
    return this.configService.get<string>('JWT_EXPIRES_IN') || '7d';
  }

  get mailUser(): string {
    return this.configService.get<string>('MAIL_USER') || '';
  }

  get mailPassword(): string {
    return this.configService.get<string>('MAIL_PASSWORD') || '';
  }

  get googleClientId(): string {
    return this.configService.get<string>('GOOGLE_CLIENT_ID') || '';
  }

  get googleClientSecret(): string {
    return this.configService.get<string>('GOOGLE_CLIENT_SECRET') || '';
  }

  get googleCallbackUrl(): string {
    return this.configService.get<string>('GOOGLE_CALLBACK_URL') || '';
  }

  get cloudinaryCloudName(): string {
    return this.configService.get<string>('CLOUDINARY_CLOUD_NAME') || '';
  }

  get cloudinaryApiKey(): string {
    return this.configService.get<string>('CLOUDINARY_API_KEY') || '';
  }

  get cloudinaryApiSecret(): string {
    return this.configService.get<string>('CLOUDINARY_API_SECRET') || '';
  }

  get frontendUrl(): string {
    return (
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000'
    );
  }

  get adminEmail(): string {
    return this.configService.get<string>('ADMIN_EMAIL') || '';
  }

  get adminPassword(): string {
    return this.configService.get<string>('ADMIN_PASSWORD') || '';
  }
}
