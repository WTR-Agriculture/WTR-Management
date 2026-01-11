import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto, UserQueryDto } from './dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async findAll(query: UserQueryDto) {
        const { search, page = 1, limit = 10 } = query;
        const skip = (page - 1) * limit;

        const where = search
            ? {
                OR: [
                    { name: { contains: search, mode: 'insensitive' as const } },
                    { email: { contains: search, mode: 'insensitive' as const } },
                ],
            }
            : {};

        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip,
                take: Number(limit),
                include: {
                    role: true,
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.user.count({ where }),
        ]);

        return {
            data: users.map((user) => ({
                id: user.id,
                email: user.email,
                name: user.name,
                role: {
                    id: user.role.id,
                    name: user.role.name,
                },
                isActive: user.isActive,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
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
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                role: {
                    include: {
                        permissions: true,
                    },
                },
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return {
            id: user.id,
            email: user.email,
            name: user.name,
            signature: user.signature,
            isActive: user.isActive,
            role: {
                id: user.role.id,
                name: user.role.name,
            },
            permissions: user.role.permissions.map((p) => p.code),
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }

    async create(dto: CreateUserDto) {
        // Check if email exists
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (existingUser) {
            throw new ConflictException('Email already exists');
        }

        // Check if role exists
        const role = await this.prisma.role.findUnique({
            where: { id: dto.roleId },
        });

        if (!role) {
            throw new NotFoundException('Role not found');
        }

        // Hash password
        const passwordHash = await bcrypt.hash(dto.password, 10);

        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                passwordHash,
                name: dto.name,
                roleId: dto.roleId,
                signature: dto.signature,
            },
            include: {
                role: true,
            },
        });

        return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: {
                id: user.role.id,
                name: user.role.name,
            },
            isActive: user.isActive,
            createdAt: user.createdAt,
        };
    }

    async update(id: string, dto: UpdateUserDto) {
        // Check if user exists
        const existingUser = await this.prisma.user.findUnique({
            where: { id },
        });

        if (!existingUser) {
            throw new NotFoundException('User not found');
        }

        // Check if email is being changed and already exists
        if (dto.email && dto.email !== existingUser.email) {
            const emailExists = await this.prisma.user.findUnique({
                where: { email: dto.email },
            });

            if (emailExists) {
                throw new ConflictException('Email already exists');
            }
        }

        // Check if role exists
        if (dto.roleId) {
            const role = await this.prisma.role.findUnique({
                where: { id: dto.roleId },
            });

            if (!role) {
                throw new NotFoundException('Role not found');
            }
        }

        // Prepare update data
        const updateData: any = {};
        if (dto.email) updateData.email = dto.email;
        if (dto.name) updateData.name = dto.name;
        if (dto.roleId) updateData.roleId = dto.roleId;
        if (dto.signature !== undefined) updateData.signature = dto.signature;
        if (dto.isActive !== undefined) updateData.isActive = dto.isActive;
        if (dto.password) {
            updateData.passwordHash = await bcrypt.hash(dto.password, 10);
        }

        const user = await this.prisma.user.update({
            where: { id },
            data: updateData,
            include: {
                role: true,
            },
        });

        return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: {
                id: user.role.id,
                name: user.role.name,
            },
            isActive: user.isActive,
            updatedAt: user.updatedAt,
        };
    }

    async remove(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        await this.prisma.user.delete({
            where: { id },
        });

        return { message: 'User deleted successfully' };
    }

    async getUserPermissions(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                userPermissions: {
                    include: {
                        permission: true,
                    },
                },
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user.userPermissions.map((up) => ({
            id: up.permission.id,
            code: up.permission.code,
            name: up.permission.name,
            module: up.permission.module,
            action: up.permission.action,
        }));
    }

    async updateUserPermissions(userId: string, permissionIds: string[]) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Delete existing user permissions
        await this.prisma.userPermission.deleteMany({
            where: { userId },
        });

        // Create new user permissions
        if (permissionIds.length > 0) {
            await this.prisma.userPermission.createMany({
                data: permissionIds.map((permissionId) => ({
                    userId,
                    permissionId,
                })),
            });
        }

        // Return updated permissions
        return this.getUserPermissions(userId);
    }

    async getAllPermissionsGrouped() {
        const permissions = await this.prisma.permission.findMany({
            orderBy: [{ module: 'asc' }, { action: 'asc' }],
        });

        // Group by module
        const grouped = permissions.reduce(
            (acc, permission) => {
                if (!acc[permission.module]) {
                    acc[permission.module] = [];
                }
                acc[permission.module].push({
                    id: permission.id,
                    code: permission.code,
                    name: permission.name,
                    action: permission.action,
                });
                return acc;
            },
            {} as Record<string, Array<{ id: string; code: string; name: string; action: string }>>,
        );

        return grouped;
    }
}

