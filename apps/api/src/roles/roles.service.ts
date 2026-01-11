import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto, UpdateRoleDto } from './dto';

@Injectable()
export class RolesService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        const roles = await this.prisma.role.findMany({
            include: {
                permissions: true,
                _count: {
                    select: { users: true },
                },
            },
            orderBy: { createdAt: 'asc' },
        });

        return roles.map((role) => ({
            id: role.id,
            name: role.name,
            description: role.description,
            usersCount: role._count.users,
            permissions: role.permissions.map((p) => ({
                id: p.id,
                code: p.code,
                name: p.name,
                module: p.module,
            })),
            createdAt: role.createdAt,
        }));
    }

    async findOne(id: string) {
        const role = await this.prisma.role.findUnique({
            where: { id },
            include: {
                permissions: true,
            },
        });

        if (!role) {
            throw new NotFoundException('Role not found');
        }

        return {
            id: role.id,
            name: role.name,
            description: role.description,
            permissions: role.permissions.map((p) => ({
                id: p.id,
                code: p.code,
                name: p.name,
                module: p.module,
            })),
            createdAt: role.createdAt,
        };
    }

    async create(dto: CreateRoleDto) {
        // Check if name exists
        const existingRole = await this.prisma.role.findUnique({
            where: { name: dto.name },
        });

        if (existingRole) {
            throw new ConflictException('Role name already exists');
        }

        const role = await this.prisma.role.create({
            data: {
                name: dto.name,
                description: dto.description,
                permissions: dto.permissionIds
                    ? {
                        connect: dto.permissionIds.map((id) => ({ id })),
                    }
                    : undefined,
            },
            include: {
                permissions: true,
            },
        });

        return {
            id: role.id,
            name: role.name,
            description: role.description,
            permissions: role.permissions.map((p) => p.code),
        };
    }

    async update(id: string, dto: UpdateRoleDto) {
        const existingRole = await this.prisma.role.findUnique({
            where: { id },
        });

        if (!existingRole) {
            throw new NotFoundException('Role not found');
        }

        // First disconnect all permissions if we're updating them
        if (dto.permissionIds) {
            await this.prisma.role.update({
                where: { id },
                data: {
                    permissions: {
                        set: [], // Disconnect all
                    },
                },
            });
        }

        const role = await this.prisma.role.update({
            where: { id },
            data: {
                name: dto.name,
                description: dto.description,
                permissions: dto.permissionIds
                    ? {
                        connect: dto.permissionIds.map((permId) => ({ id: permId })),
                    }
                    : undefined,
            },
            include: {
                permissions: true,
            },
        });

        return {
            id: role.id,
            name: role.name,
            description: role.description,
            permissions: role.permissions.map((p) => p.code),
        };
    }

    async remove(id: string) {
        const role = await this.prisma.role.findUnique({
            where: { id },
            include: {
                _count: { select: { users: true } },
            },
        });

        if (!role) {
            throw new NotFoundException('Role not found');
        }

        if (role._count.users > 0) {
            throw new ConflictException('Cannot delete role with assigned users');
        }

        await this.prisma.role.delete({
            where: { id },
        });

        return { message: 'Role deleted successfully' };
    }

    async getAllPermissions() {
        const permissions = await this.prisma.permission.findMany({
            orderBy: [{ module: 'asc' }, { code: 'asc' }],
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
                });
                return acc;
            },
            {} as Record<string, Array<{ id: string; code: string; name: string }>>,
        );

        return grouped;
    }
}
