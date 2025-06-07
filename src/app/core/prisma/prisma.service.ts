import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      log: ['query', 'info', 'warn', 'error'], // Enable logging for database queries
    });
  }

  // Connect to database when module initializes
  async onModuleInit() {
    await this.$connect();
  }

  // Disconnect from database when module destroys
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
