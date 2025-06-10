import {
  Injectable,
  NotFoundException,
  Inject,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { UserRole, Category } from '@prisma/client';
import {
  CategoryWithRelations,
  CategoryQuery,
} from '../../core/interfaces/category/category.interface';

@Injectable()
export class CategoryService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async getAllCategories(
    query: CategoryQuery,
  ): Promise<CategoryWithRelations[]> {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;
    const skip = (page - 1) * limit;
    const categories = await this.prisma.category.findMany({
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
      include: {
        materials: true,
        created_by: {
          select: {
            id: true,
            full_name: true,
            role: true,
          },
        },
      },
    });
    this.logger.info('Get all categories', { context: 'CategoryService' });
    return categories;
  }

  async createCategory(
    dto: CreateCategoryDto,
    userId: string,
  ): Promise<Category> {
    const category = await this.prisma.category.create({
      data: {
        name: dto.name,
        description: dto.description,
        created_by_id: userId,
      },
    });
    this.logger.info(`Category created: ${category.name}`, {
      context: 'CategoryService',
    });
    return category;
  }

  async updateCategory(
    id: string,
    dto: UpdateCategoryDto,
    userId: string,
    userRole: UserRole,
  ): Promise<Category> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        created_by: true,
      },
    });
    if (!category) {
      this.logger.warn(`Category not found: ${id}`, {
        context: 'CategoryService',
      });
      throw new NotFoundException('Category not found');
    }
    if (userRole !== UserRole.ADMIN && category.created_by_id !== userId) {
      this.logger.warn(
        `User ${userId} trying to update category ${id} created by ${category.created_by_id}`,
        {
          context: 'CategoryService',
        },
      );
      throw new ForbiddenException(
        'You can only update categories you created',
      );
    }
    const updated = await this.prisma.category.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
      },
    });
    this.logger.info(`Category updated: ${id}`, { context: 'CategoryService' });
    return updated;
  }

  async deleteCategory(
    id: string,
    userId: string,
    userRole: UserRole,
  ): Promise<null> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        created_by: true,
      },
    });
    if (!category) {
      this.logger.warn(`Category not found: ${id}`, {
        context: 'CategoryService',
      });
      throw new NotFoundException('Category not found');
    }
    if (userRole !== UserRole.ADMIN && category.created_by_id !== userId) {
      this.logger.warn(
        `User ${userId} trying to delete category ${id} created by ${category.created_by_id}`,
        {
          context: 'CategoryService',
        },
      );
      throw new ForbiddenException(
        'You can only delete categories you created',
      );
    }
    await this.prisma.category.delete({ where: { id } });
    this.logger.info(`Category deleted: ${id}`, { context: 'CategoryService' });
    return null;
  }
}
