import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './core/config/config.module';
import { PrismaModule } from './core/prisma/prisma.module';
import { LogModule } from './core/log/log.module';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
    }),
    ConfigModule,
    PrismaModule,
    LogModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
