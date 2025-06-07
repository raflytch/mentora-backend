import { Injectable } from '@nestjs/common';
import * as winston from 'winston';

@Injectable()
export class LogService {
  private logger: winston.Logger;

  constructor() {
    // Configure winston logger with console transport only
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, stack }) => {
          return `${timestamp} [${level}]: ${message}${stack ? `\n${stack}` : ''}`;
        }),
      ),
      transports: [
        new winston.transports.Console(), // Log to terminal only
      ],
    });
  }

  // Log info messages
  info(message: string, meta?: any) {
    this.logger.info(message, meta);
  }

  // Log error messages
  error(message: string, error?: Error) {
    this.logger.error(message, { error: error?.message, stack: error?.stack });
  }

  // Log warning messages
  warn(message: string, meta?: any) {
    this.logger.warn(message, meta);
  }

  // Log debug messages
  debug(message: string, meta?: any) {
    this.logger.debug(message, meta);
  }

  // Get winston logger instance
  getLogger(): winston.Logger {
    return this.logger;
  }
}
