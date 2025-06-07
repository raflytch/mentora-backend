import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

interface WelcomeResponse {
  message: string;
  application: string;
  version: string;
  timestamp: string;
  status: string;
  features: string[];
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getWelcome(): WelcomeResponse {
    return this.appService.getWelcome();
  }
}
