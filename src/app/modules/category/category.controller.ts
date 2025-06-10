import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Inject,
  Request,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { RolesGuard } from '../../core/guards/roles.guard';
import { UserRole, Category } from '@prisma/client';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import {
  CategoryWithRelations,
  AuthenticatedRequest,
} from '../../core/interfaces/category/category.interface';
import { ApiResponse } from '../../core/interfaces/response.interface';

@Controller('api/v1/category')
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllCategories(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<ApiResponse<CategoryWithRelations[]>> {
    this.logger.info('Get all categories', { context: 'CategoryController' });
    return this.categoryService.getAllCategories({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
    });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  async createCategory(
    @Body() dto: CreateCategoryDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponse<Category>> {
    this.logger.info('Create category', { context: 'CategoryController' });
    return this.categoryService.createCategory(dto, req.user.id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  async updateCategory(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponse<Category>> {
    this.logger.info(`Update category: ${id}`, {
      context: 'CategoryController',
    });
    return this.categoryService.updateCategory(
      id,
      dto,
      req.user.id,
      req.user.role,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  async deleteCategory(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponse<null>> {
    this.logger.info(`Delete category: ${id}`, {
      context: 'CategoryController',
    });
    return this.categoryService.deleteCategory(id, req.user.id, req.user.role);
  }
}
