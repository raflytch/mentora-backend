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
import { GoogleOAuthGuard } from '../../core/auth/guards/google-oauth.guard';
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
import { UserRole } from '@prisma/client';
import { Roles } from '../../core/decorators/roles.decorator';
import { RolesGuard } from '../../core/guards/roles.guard';
import {
  AuthResponse,
  RegisterResponse,
  MessageResponse,
  FormattedUserResponse,
  StudentWithPurchases,
  UsersResponse,
  AuthenticatedRequest,
  GoogleAuthenticatedRequest,
} from '../../core/interfaces/user/user.interface';

@Controller('api/v1/user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto): Promise<RegisterResponse> {
    this.logger.info('User registration attempt', 'UserController');
    return this.userService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<AuthResponse> {
    this.logger.info('User login attempt', 'UserController');
    return this.userService.login(loginDto);
  }

  @Get('auth/google')
  @UseGuards(GoogleOAuthGuard)
  async googleAuth(@Req() req: Request): Promise<void> {}

  @Get('auth/google/callback')
  @UseGuards(GoogleOAuthGuard)
  async googleAuthRedirect(
    @Req() req: GoogleAuthenticatedRequest,
    @Res() res: Response,
  ): Promise<void> {
    this.logger.info('Google OAuth callback', 'UserController');
    const result = await this.userService.googleLoginCallback(req.user);
    const frontendUrl = this.configService.frontendUrl;
    res.redirect(`${frontendUrl}/auth/callback?token=${result.access_token}`);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(
    @Body() verifyOtpDto: VerifyOtpDto,
    @Query('email') email: string,
  ): Promise<MessageResponse> {
    this.logger.info('OTP verification attempt', 'UserController');
    return this.userService.verifyOtp(email, verifyOtpDto);
  }

  @Post('resend-otp')
  @HttpCode(HttpStatus.OK)
  async resendOtp(
    @Body() resendOtpDto: ResendOtpDto,
  ): Promise<MessageResponse> {
    this.logger.info('OTP resend request', 'UserController');
    return this.userService.resendOtp(resendOtpDto);
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async getMe(
    @Request() req: AuthenticatedRequest,
  ): Promise<FormattedUserResponse> {
    this.logger.info('Get current user data', 'UserController');
    return this.userService.getMe(req.user.id);
  }

  @Patch('profile')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @SingleFileUpload('profile_picture', 'image')
  async updateProfile(
    @Request() req: AuthenticatedRequest,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() profilePicture?: Express.Multer.File,
  ): Promise<FormattedUserResponse> {
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
  @Roles(UserRole.TEACHER)
  async getStudentsByTeacher(
    @Request() req: AuthenticatedRequest,
  ): Promise<StudentWithPurchases[]> {
    this.logger.info('Get students by teacher', 'UserController');
    return this.userService.getStudentsByTeacher(req.user.id);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAllUsers(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('role') role?: UserRole,
  ): Promise<UsersResponse> {
    this.logger.info('Get all users', 'UserController');
    return this.userService.getAllUsers({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      role: role as UserRole,
    });
  }

  @Post('delete-account/request')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async requestDeleteAccount(
    @Request() req: AuthenticatedRequest,
  ): Promise<MessageResponse> {
    this.logger.info('Request account deletion', 'UserController');
    return this.userService.requestDeleteAccount(req.user.id);
  }

  @Delete('delete-account')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async deleteAccount(
    @Request() req: AuthenticatedRequest,
    @Body() deleteAccountDto: DeleteAccountDto,
  ): Promise<MessageResponse> {
    this.logger.info('Delete user account', 'UserController');
    return this.userService.deleteAccount(req.user.id, deleteAccountDto);
  }
}
