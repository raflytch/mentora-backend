import { IsString } from 'class-validator';

export class VerifyOtpDto {
  @IsString()
  code: string;
}
