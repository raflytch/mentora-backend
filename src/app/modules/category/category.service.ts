import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class CategoryService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async getAllCategories(query: { page?: number; limit?: number }) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;
    const skip = (page - 1) * limit;
    const [categories, total] = await Promise.all([
      this.prisma.category.findMany({
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          materials: true,
        },
      }),
      this.prisma.category.count(),
    ]);
    this.logger.info('Get all categories', { context: 'CategoryService' });
    return {
      data: categories,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async createCategory(dto: CreateCategoryDto) {
    const category = await this.prisma.category.create({
      data: {
        name: dto.name,
        description: dto.description,
      },
    });
    this.logger.info(`Category created: ${category.name}`, {
      context: 'CategoryService',
    });
    return category;
  }

  async updateCategory(id: string, dto: UpdateCategoryDto) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) {
      this.logger.warn(`Category not found: ${id}`, {
        context: 'CategoryService',
      });
      throw new NotFoundException('Category not found');
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

  async deleteCategory(id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) {
      this.logger.warn(`Category not found: ${id}`, {
        context: 'CategoryService',
      });
      throw new NotFoundException('Category not found');
    }
    await this.prisma.category.delete({ where: { id } });
    this.logger.info(`Category deleted: ${id}`, { context: 'CategoryService' });
    return { message: 'Category deleted successfully' };
  }
}
