import { IsString } from 'class-validator';

export class DeleteAccountDto {
  @IsString()
  otp_code: string;
}
