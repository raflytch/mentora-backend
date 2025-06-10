import { IsString, IsEmail, IsOptional } from 'class-validator';

export class GoogleLoginDto {
  @IsEmail()
  email: string;

  @IsString()
  full_name: string;

  @IsOptional()
  @IsString()
  profile_picture?: string;

  @IsString()
  google_id: string;
}
