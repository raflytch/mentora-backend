import { Controller, Get, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import { Logger } from 'winston';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

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
  constructor(
    private readonly appService: AppService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
  ) {}

  @Get()
  getWelcome(): Promise<WelcomeResponse> {
    this.logger.log('GET / - Welcome endpoint called', 'AppController');
    return this.appService.getWelcome();
  }
}
