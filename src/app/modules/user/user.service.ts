import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../core/prisma/prisma.service';
import { MailService } from '../../core/mail/mail.service';
import { CloudinaryService } from '../../core/cloudinary/cloudinary.service';
import { ConfigService } from '../../core/config/config.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DeleteAccountDto } from './dto/delete-account.dto';
import { UserRole, User, Prisma } from '@prisma/client';
import {
  UserWithProfiles,
  GoogleUserData,
  FormattedUserResponse,
  StudentWithPurchases,
  UserQuery,
  UsersResponse,
} from '../../core/interfaces/user/user.interface';
import { ApiResponse } from '../../core/interfaces/response.interface';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly configService: ConfigService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async register(
    registerDto: RegisterDto,
  ): Promise<ApiResponse<{ user_id: string }>> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });
    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }
    const hashedPassword = await bcrypt.hash(registerDto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        full_name: registerDto.full_name,
        role: registerDto.role,
        phone: registerDto.phone,
      },
    });
    if (registerDto.role === UserRole.TEACHER) {
      await this.prisma.teacherProfile.create({
        data: { user_id: user.id },
      });
    } else {
      await this.prisma.studentProfile.create({
        data: { user_id: user.id },
      });
    }
    const otpCode = this.generateOtpCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await this.prisma.otpCode.create({
      data: {
        user_id: user.id,
        code: otpCode,
        expires_at: expiresAt,
      },
    });
    await this.mailService.sendOtpVerification(
      user.email,
      user.full_name,
      otpCode,
    );
    this.logger.info(`User registered: ${user.email}`, {
      context: 'UserService',
    });
    return {
      status: 'success',
      message:
        'Registration successful. Please check your email for OTP verification.',
      data: { user_id: user.id },
    };
  }

  async login(
    loginDto: LoginDto,
  ): Promise<
    ApiResponse<{ access_token: string; user: FormattedUserResponse }>
  > {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
      include: {
        teacher_profile: true,
        student_profile: true,
      },
    });
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (!user.is_email_verified) {
      throw new UnauthorizedException('Please verify your email first');
    }
    const payload = { email: user.email, sub: user.id, role: user.role };
    const access_token = this.jwtService.sign(payload);
    this.logger.info(`User logged in: ${user.email}`, {
      context: 'UserService',
    });
    return {
      status: 'success',
      message: 'Login successful',
      data: {
        access_token,
        user: this.formatUserResponse(user),
      },
    };
  }

  async googleLoginCallback(
    googleUser: GoogleUserData,
  ): Promise<
    ApiResponse<{ access_token: string; user: FormattedUserResponse }>
  > {
    const { email, full_name, profile_picture, google_id } = googleUser;
    let user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        teacher_profile: true,
        student_profile: true,
      },
    });
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          full_name,
          profile_picture,
          google_id,
          role: UserRole.STUDENT,
          is_email_verified: true,
          verification_status: 'VERIFIED',
        },
        include: {
          teacher_profile: true,
          student_profile: true,
        },
      });
      await this.prisma.studentProfile.create({
        data: { user_id: user.id },
      });
    } else if (!user.google_id) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          google_id,
          profile_picture,
          is_email_verified: true,
          verification_status: 'VERIFIED',
        },
        include: {
          teacher_profile: true,
          student_profile: true,
        },
      });
    }
    const payload = { email: user.email, sub: user.id, role: user.role };
    const access_token = this.jwtService.sign(payload);
    this.logger.info(`User logged in via Google: ${user.email}`, {
      context: 'UserService',
    });
    return {
      status: 'success',
      message: 'Google login successful',
      data: {
        access_token,
        user: this.formatUserResponse(user),
      },
    };
  }

  async verifyOtp(
    email: string,
    verifyOtpDto: VerifyOtpDto,
  ): Promise<ApiResponse<null>> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const otpRecord = await this.prisma.otpCode.findFirst({
      where: {
        user_id: user.id,
        code: verifyOtpDto.code,
        is_used: false,
        expires_at: {
          gt: new Date(),
        },
      },
    });
    if (!otpRecord) {
      throw new BadRequestException('Invalid or expired OTP code');
    }
    await this.prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { is_used: true },
    });
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        is_email_verified: true,
        verification_status: 'VERIFIED',
      },
    });
    this.logger.info(`Email verified for user: ${user.email}`, {
      context: 'UserService',
    });
    return {
      status: 'success',
      message: 'Email verified successfully',
      data: null,
    };
  }

  async resendOtp(resendOtpDto: ResendOtpDto): Promise<ApiResponse<null>> {
    const user = await this.prisma.user.findUnique({
      where: { email: resendOtpDto.email },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.is_email_verified) {
      throw new BadRequestException('Email is already verified');
    }
    await this.prisma.otpCode.updateMany({
      where: { user_id: user.id, is_used: false },
      data: { is_used: true },
    });
    const otpCode = this.generateOtpCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await this.prisma.otpCode.create({
      data: {
        user_id: user.id,
        code: otpCode,
        expires_at: expiresAt,
      },
    });
    await this.mailService.sendOtpVerification(
      user.email,
      user.full_name,
      otpCode,
    );
    this.logger.info(`OTP resent to: ${user.email}`, {
      context: 'UserService',
    });
    return {
      status: 'success',
      message: 'OTP sent successfully',
      data: null,
    };
  }

  async getMe(userId: string): Promise<ApiResponse<FormattedUserResponse>> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        teacher_profile: true,
        student_profile: true,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      status: 'success',
      message: 'User data retrieved successfully',
      data: this.formatUserResponse(user),
    };
  }

  async updateUser(
    userId: string,
    updateUserDto: UpdateUserDto,
    profilePicture?: Express.Multer.File,
  ): Promise<ApiResponse<FormattedUserResponse>> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        teacher_profile: true,
        student_profile: true,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    let profilePictureUrl = user.profile_picture;
    if (profilePicture) {
      const uploadResult = await this.cloudinaryService.uploadFile(
        profilePicture,
        'mentora/profiles',
      );
      profilePictureUrl = uploadResult.secure_url;
    }
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        full_name: updateUserDto.full_name || user.full_name,
        phone: updateUserDto.phone || user.phone,
        profile_picture: profilePictureUrl,
      },
      include: {
        teacher_profile: true,
        student_profile: true,
      },
    });
    if (user.role === UserRole.TEACHER && user.teacher_profile) {
      await this.prisma.teacherProfile.update({
        where: { user_id: userId },
        data: {
          bio: updateUserDto.bio || user.teacher_profile.bio,
          education: updateUserDto.education || user.teacher_profile.education,
          subjects: updateUserDto.subjects || user.teacher_profile.subjects,
        },
      });
    }
    if (user.role === UserRole.STUDENT && user.student_profile) {
      await this.prisma.studentProfile.update({
        where: { user_id: userId },
        data: {
          grade: updateUserDto.grade || user.student_profile.grade,
          school: updateUserDto.school || user.student_profile.school,
          interests: updateUserDto.interests || user.student_profile.interests,
        },
      });
    }
    const finalUser = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        teacher_profile: true,
        student_profile: true,
      },
    });
    this.logger.info(`User updated: ${updatedUser.email}`, {
      context: 'UserService',
    });
    return {
      status: 'success',
      message: 'Profile updated successfully',
      data: this.formatUserResponse(finalUser!),
    };
  }

  async getStudentsByTeacher(
    teacherId: string,
  ): Promise<ApiResponse<StudentWithPurchases[]>> {
    const teacher = await this.prisma.user.findUnique({
      where: { id: teacherId, role: UserRole.TEACHER },
    });
    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }
    const materials = await this.prisma.material.findMany({
      where: { teacher_id: teacherId },
      select: { id: true },
    });
    const materialIds = materials.map((material) => material.id);
    const payments = await this.prisma.payment.findMany({
      where: {
        material_id: { in: materialIds },
        status: 'SUCCESS',
      },
      include: {
        user: {
          include: {
            student_profile: true,
          },
        },
        material: {
          select: {
            title: true,
            price: true,
          },
        },
      },
    });
    const studentsMap = new Map<string, StudentWithPurchases>();
    payments.forEach((payment) => {
      const student = payment.user;
      if (!studentsMap.has(student.id)) {
        studentsMap.set(student.id, {
          ...this.formatUserResponse(student),
          purchased_materials: [],
          total_spent: 0,
        });
      }
      const studentData = studentsMap.get(student.id)!;
      if (payment.material) {
        studentData.purchased_materials.push({
          id: payment.material_id || '',
          title: payment.material.title,
          price: payment.material.price,
          purchased_at: payment.paid_at,
        });
        studentData.total_spent += payment.amount;
      }
    });
    return {
      status: 'success',
      message: 'Students retrieved successfully',
      data: Array.from(studentsMap.values()),
    };
  }

  async getAllUsers(query: UserQuery): Promise<ApiResponse<UsersResponse>> {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;
    const skip = (page - 1) * limit;
    const where: Prisma.UserWhereInput = {};
    if (query.role) {
      where.role = query.role;
    }
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          teacher_profile: true,
          student_profile: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);
    return {
      status: 'success',
      message: 'Users retrieved successfully',
      data: {
        users: users.map((user) => this.formatUserResponse(user)),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async requestDeleteAccount(userId: string): Promise<ApiResponse<null>> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.prisma.otpCode.updateMany({
      where: { user_id: userId, is_used: false },
      data: { is_used: true },
    });
    const otpCode = this.generateOtpCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await this.prisma.otpCode.create({
      data: {
        user_id: userId,
        code: otpCode,
        expires_at: expiresAt,
      },
    });
    await this.mailService.sendDeleteAccountOtp(
      user.email,
      user.full_name,
      otpCode,
    );
    this.logger.info(`Delete account OTP sent to: ${user.email}`, {
      context: 'UserService',
    });
    return {
      status: 'success',
      message: 'Delete account OTP sent to your email',
      data: null,
    };
  }

  async deleteAccount(
    userId: string,
    deleteAccountDto: DeleteAccountDto,
  ): Promise<ApiResponse<null>> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const otpRecord = await this.prisma.otpCode.findFirst({
      where: {
        user_id: userId,
        code: deleteAccountDto.otp_code,
        is_used: false,
        expires_at: {
          gt: new Date(),
        },
      },
    });
    if (!otpRecord) {
      throw new BadRequestException('Invalid or expired OTP code');
    }
    await this.prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { is_used: true },
    });
    await this.prisma.user.delete({
      where: { id: userId },
    });
    this.logger.info(`User account deleted: ${user.email}`, {
      context: 'UserService',
    });
    return {
      status: 'success',
      message: 'Account deleted successfully',
      data: null,
    };
  }

  private generateOtpCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private formatUserResponse(user: UserWithProfiles): FormattedUserResponse {
    return {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      profile_picture: user.profile_picture,
      phone: user.phone,
      is_email_verified: user.is_email_verified,
      verification_status: user.verification_status,
      created_at: user.created_at,
      updated_at: user.updated_at,
      teacher_profile: user.teacher_profile,
      student_profile: user.student_profile,
    };
  }
}
