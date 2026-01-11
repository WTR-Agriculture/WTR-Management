import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBranchDto, UpdateBranchDto, BranchQueryDto } from './dto';

@Injectable()
export class BranchesService {
    constructor(private prisma: PrismaService) { }

    async findAll(query: BranchQueryDto) {
        const { search, page = 1, limit = 20 } = query;
        const skip = (page - 1) * limit;

        const where = {
            isActive: true,
            ...(search && {
                OR: [
                    { code: { contains: search, mode: 'insensitive' as const } },
                    { name: { contains: search, mode: 'insensitive' as const } },
                ],
            }),
        };

        const [branches, total] = await Promise.all([
            this.prisma.branch.findMany({
                where,
                skip,
                take: Number(limit),
                orderBy: { code: 'asc' },
                include: {
                    _count: { select: { employees: true } },
                },
            }),
            this.prisma.branch.count({ where }),
        ]);

        return {
            data: branches.map((branch) => ({
                id: branch.id,
                code: branch.code,
                name: branch.name,
                address: branch.address,
                phone: branch.phone,
                isActive: branch.isActive,
                employeeCount: branch._count.employees,
                createdAt: branch.createdAt,
            })),
            meta: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit)),
            },
        };
    }

    async findOne(id: string) {
        const branch = await this.prisma.branch.findUnique({
            where: { id },
            include: {
                _count: { select: { employees: true } },
            },
        });

        if (!branch) {
            throw new NotFoundException('Branch not found');
        }

        return {
            ...branch,
            employeeCount: branch._count.employees,
        };
    }

    async create(dto: CreateBranchDto) {
        const existing = await this.prisma.branch.findUnique({
            where: { code: dto.code },
        });

        if (existing) {
            throw new ConflictException('Branch code already exists');
        }

        return this.prisma.branch.create({
            data: dto,
        });
    }

    async update(id: string, dto: UpdateBranchDto) {
        const branch = await this.prisma.branch.findUnique({
            where: { id },
        });

        if (!branch) {
            throw new NotFoundException('Branch not found');
        }

        if (dto.code && dto.code !== branch.code) {
            const codeExists = await this.prisma.branch.findUnique({
                where: { code: dto.code },
            });
            if (codeExists) {
                throw new ConflictException('Branch code already exists');
            }
        }

        return this.prisma.branch.update({
            where: { id },
            data: dto,
        });
    }

    async remove(id: string) {
        const branch = await this.prisma.branch.findUnique({
            where: { id },
            include: {
                _count: { select: { employees: true } },
            },
        });

        if (!branch) {
            throw new NotFoundException('Branch not found');
        }

        if (branch._count.employees > 0) {
            throw new ConflictException('Cannot delete branch with employees');
        }

        // Soft delete
        return this.prisma.branch.update({
            where: { id },
            data: { isActive: false },
        });
    }
}
