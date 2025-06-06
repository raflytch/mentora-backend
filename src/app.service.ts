import { Injectable } from '@nestjs/common';

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
  getWelcome(): WelcomeResponse {
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
