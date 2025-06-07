import { Injectable, Inject } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigService } from '../config/config.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(
    private readonly configService: ConfigService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.mailUser,
        pass: this.configService.mailPassword,
      },
    });
  }

  async sendOtpVerification(
    email: string,
    name: string,
    otpCode: string,
  ): Promise<void> {
    const templatePath = path.join(
      process.cwd(),
      'src',
      'app',
      'core',
      'templates',
      'otp-verification.html',
    );
    let htmlTemplate = fs.readFileSync(templatePath, 'utf-8');

    htmlTemplate = htmlTemplate.replace('{{name}}', name);
    htmlTemplate = htmlTemplate.replace('{{otpCode}}', otpCode);

    const mailOptions = {
      from: `"Mentora Platform" <${this.configService.mailUser}>`,
      to: email,
      subject: 'Verify Your Email - Mentora Platform',
      html: htmlTemplate,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.info(`OTP verification email sent to ${email}`, {
        context: 'MailService',
      });
    } catch (error) {
      this.logger.error('Failed to send OTP verification email', {
        error,
        context: 'MailService',
      });
      throw error;
    }
  }

  async sendDeleteAccountOtp(
    email: string,
    name: string,
    otpCode: string,
  ): Promise<void> {
    const templatePath = path.join(
      process.cwd(),
      'src',
      'app',
      'core',
      'templates',
      'delete-account-otp.html',
    );
    let htmlTemplate = fs.readFileSync(templatePath, 'utf-8');

    htmlTemplate = htmlTemplate.replace('{{name}}', name);
    htmlTemplate = htmlTemplate.replace('{{otpCode}}', otpCode);

    const mailOptions = {
      from: `"Mentora Platform" <${this.configService.mailUser}>`,
      to: email,
      subject: 'Account Deletion Verification - Mentora Platform',
      html: htmlTemplate,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.info(`Delete account OTP email sent to ${email}`, {
        context: 'MailService',
      });
    } catch (error) {
      this.logger.error('Failed to send delete account OTP email', {
        error,
        context: 'MailService',
      });
      throw error;
    }
  }
}
