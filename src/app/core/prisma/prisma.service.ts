import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
  Inject,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
        { emit: 'event', level: 'error' },
      ],
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();

    (this as any).$on('query', (e: any) => {
      this.logger.debug(`Query: ${e.query}`, { context: 'PrismaService' });
      this.logger.debug(`Params: ${e.params}`, { context: 'PrismaService' });
      this.logger.debug(`Duration: ${e.duration}ms`, {
        context: 'PrismaService',
      });
    });

    (this as any).$on('info', (e: any) => {
      this.logger.info(e.message, { context: 'PrismaService' });
    });

    (this as any).$on('warn', (e: any) => {
      this.logger.warn(e.message, { context: 'PrismaService' });
    });

    (this as any).$on('error', (e: any) => {
      this.logger.error(e.message, { context: 'PrismaService' });
    });

    this.logger.info('✅ Database connected successfully', {
      context: 'PrismaService',
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.info('❌ Database disconnected', { context: 'PrismaService' });
  }
}
