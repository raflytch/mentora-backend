import { Injectable, Inject } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

interface WelcomeResponse {
  message: string;
  application: string;
  version: string;
  timestamp: string;
  status: string;
  features: string[];
}

@Injectable()
export class AppService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
  ) {}

  async getWelcome(): Promise<WelcomeResponse> {
    this.logger.log('Welcome endpoint accessed', 'AppService');

    return {
      message: 'Welcome to Mentora Backend API',
      application: 'Mentora Learning Platform',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      status: 'active',
      features: [
        'User Registration & OTP Email Verification',
        'Teacher & Student Profiles',
        'Course Materials Management',
        'Live Chat System',
        'Payment Integration with Midtrans',
        'Review & Rating System',
        'Interactive Quiz System',
        'Notification System',
        'Payment History',
        'Quiz History & Progress',
      ],
    };
  }
}
