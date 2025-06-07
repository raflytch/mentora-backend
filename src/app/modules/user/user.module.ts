import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from '../../core/prisma/prisma.module';
import { MailModule } from '../../core/mail/mail.module';
import { CloudinaryModule } from '../../core/cloudinary/cloudinary.module';
import { ConfigModule } from '../../core/config/config.module';
import { JwtStrategy } from '../../core/auth/strategies/jwt.strategy';
import { GoogleStrategy } from '../../core/auth/strategies/google.strategy';
import { ConfigService } from '../../core/config/config.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.jwtSecret,
        signOptions: { expiresIn: configService.jwtExpiresIn },
      }),
      inject: [ConfigService],
    }),
    PrismaModule,
    MailModule,
    CloudinaryModule,
    ConfigModule,
  ],
  providers: [UserService, JwtStrategy, GoogleStrategy],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
