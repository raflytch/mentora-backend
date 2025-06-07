import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  UseGuards,
  Request,
  UploadedFile,
  Param,
  Inject,
  Res,
  Query,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { GoogleOAuthGuard } from 'app/core/auth/guards/google-oauth.guard';
import { SingleFileUpload } from '../../core/decorators/file-upload.decorator';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DeleteAccountDto } from './dto/delete-account.dto';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { ConfigService } from '../../core/config/config.service';

@Controller('api/v1/user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    this.logger.info('User registration attempt', 'UserController');
    return this.userService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    this.logger.info('User login attempt', 'UserController');
    return this.userService.login(loginDto);
  }

  // Google OAuth redirect - GET endpoint
  @Get('auth/google')
  @UseGuards(GoogleOAuthGuard)
  async googleAuth(@Req() req) {
    // Redirects to Google
  }

  // Google OAuth callback
  @Get('auth/google/callback')
  @UseGuards(GoogleOAuthGuard)
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    this.logger.info('Google OAuth callback', 'UserController');
    const result = await this.userService.googleLoginCallback(req.user);

    // Redirect to frontend with token
    const frontendUrl = this.configService.frontendUrl;
    return res.redirect(
      `${frontendUrl}/auth/callback?token=${result.access_token}`,
    );
  }

  // Verify OTP - NO JWT required (user belum verified)
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(
    @Body() verifyOtpDto: VerifyOtpDto,
    @Query('email') email: string,
  ) {
    this.logger.info('OTP verification attempt', 'UserController');
    return this.userService.verifyOtp(email, verifyOtpDto);
  }

  @Post('resend-otp')
  @HttpCode(HttpStatus.OK)
  async resendOtp(@Body() resendOtpDto: ResendOtpDto) {
    this.logger.info('OTP resend request', 'UserController');
    return this.userService.resendOtp(resendOtpDto);
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async getMe(@Request() req) {
    this.logger.info('Get current user data', 'UserController');
    return this.userService.getMe(req.user.id);
  }

  @Patch('profile')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @SingleFileUpload('profile_picture', 'image')
  async updateProfile(
    @Request() req,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() profilePicture?: Express.Multer.File,
  ) {
    this.logger.info('Update user profile', 'UserController');
    return this.userService.updateUser(
      req.user.id,
      updateUserDto,
      profilePicture,
    );
  }

  @Get('students')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async getStudentsByTeacher(@Request() req) {
    this.logger.info('Get students by teacher', 'UserController');
    return this.userService.getStudentsByTeacher(req.user.id);
  }

  @Post('delete-account/request')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async requestDeleteAccount(@Request() req) {
    this.logger.info('Request account deletion', 'UserController');
    return this.userService.requestDeleteAccount(req.user.id);
  }

  @Delete('delete-account')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async deleteAccount(
    @Request() req,
    @Body() deleteAccountDto: DeleteAccountDto,
  ) {
    this.logger.info('Delete user account', 'UserController');
    return this.userService.deleteAccount(req.user.id, deleteAccountDto);
  }
}
