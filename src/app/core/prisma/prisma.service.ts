import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
  Inject,
} from '@nestjs/common';

import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { Prisma, PrismaClient } from '../../../../generated/prisma';

@Injectable()
export class PrismaService
  extends PrismaClient<
    Prisma.PrismaClientOptions,
    'query' | 'info' | 'warn' | 'error'
  >
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

    this.$on('query', (e) => {
      this.logger.debug(`Query: ${e.query}`, { context: 'PrismaService' });
      this.logger.debug(`Params: ${e.params}`, { context: 'PrismaService' });
      this.logger.debug(`Duration: ${e.duration}ms`, {
        context: 'PrismaService',
      });
    });

    this.$on('info', (e) => {
      this.logger.info(e.message, { context: 'PrismaService' });
    });

    this.$on('warn', (e) => {
      this.logger.warn(e.message, { context: 'PrismaService' });
    });

    this.$on('error', (e) => {
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
