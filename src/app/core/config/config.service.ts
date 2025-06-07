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

  get<T>(key: string, defaultValue?: T): T | undefined {
    if (defaultValue !== undefined) {
      return this.nestConfigService.get<T>(key, defaultValue);
    }
    return this.nestConfigService.get<T>(key);
  }

  get jwtSecret(): string {
    return this.nestConfigService.get<string>('JWT_SECRET') || 'default-secret';
  }

  get emailConfig() {
    return {
      host: this.nestConfigService.get<string>('EMAIL_HOST'),
      port: this.nestConfigService.get<number>('EMAIL_PORT'),
      user: this.nestConfigService.get<string>('EMAIL_USER'),
      pass: this.nestConfigService.get<string>('EMAIL_PASS'),
    };
  }
}
