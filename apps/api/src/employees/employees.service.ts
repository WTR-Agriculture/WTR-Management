import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto, UpdateEmployeeDto, EmployeeQueryDto } from './dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class EmployeesService {
    constructor(private prisma: PrismaService) { }

    async findAll(query: EmployeeQueryDto) {
        const { search, branchId, includeInactive, page = 1, limit = 20 } = query;
        const skip = (page - 1) * limit;

        const where: any = {
            ...(includeInactive ? {} : { isActive: true }),
            ...(branchId && { branchId }),
            ...(search && {
                OR: [
                    { empCode: { contains: search, mode: 'insensitive' } },
                    { firstName: { contains: search, mode: 'insensitive' } },
                    { lastName: { contains: search, mode: 'insensitive' } },
                    { position: { contains: search, mode: 'insensitive' } },
                ],
            }),
        };

        const [employees, total] = await Promise.all([
            this.prisma.employee.findMany({
                where,
                skip,
                take: Number(limit),
                orderBy: { empCode: 'asc' },
                include: {
                    branch: { select: { id: true, code: true, name: true } },
                    user: { select: { id: true, email: true, name: true } },
                },
            }),
            this.prisma.employee.count({ where }),
        ]);

        return {
            data: employees.map((emp) => ({
                id: emp.id,
                empCode: emp.empCode,
                title: emp.title,
                firstName: emp.firstName,
                lastName: emp.lastName,
                fullName: `${emp.title}${emp.firstName} ${emp.lastName}`,
                gender: emp.gender,
                nationalId: emp.nationalId,
                nationality: emp.nationality,
                birthDate: emp.birthDate,
                position: emp.position,
                dailyWage: emp.dailyWage,
                hireDate: emp.hireDate,
                resignDate: emp.resignDate,
                branch: emp.branch,
                user: emp.user,
                isActive: emp.isActive,
                createdAt: emp.createdAt,
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
        const employee = await this.prisma.employee.findUnique({
            where: { id },
            include: {
                branch: true,
                user: { select: { id: true, email: true, name: true } },
                createdBy: { select: { id: true, name: true } },
            },
        });

        if (!employee) {
            throw new NotFoundException('Employee not found');
        }

        return {
            ...employee,
            fullName: `${employee.title}${employee.firstName} ${employee.lastName}`,
        };
    }

    async create(dto: CreateEmployeeDto, createdById?: string) {
        // Check empCode uniqueness
        const existingEmpCode = await this.prisma.employee.findUnique({
            where: { empCode: dto.empCode },
        });
        if (existingEmpCode) {
            throw new ConflictException('Employee code already exists');
        }

        // Check nationalId uniqueness if provided
        if (dto.nationalId) {
            const existingNationalId = await this.prisma.employee.findUnique({
                where: { nationalId: dto.nationalId },
            });
            if (existingNationalId) {
                throw new ConflictException('National ID already exists');
            }
        }

        // Check branch exists
        const branch = await this.prisma.branch.findUnique({
            where: { id: dto.branchId },
        });
        if (!branch) {
            throw new NotFoundException('Branch not found');
        }

        return this.prisma.employee.create({
            data: {
                empCode: dto.empCode,
                title: dto.title,
                firstName: dto.firstName,
                lastName: dto.lastName,
                firstNameEn: dto.firstNameEn,
                lastNameEn: dto.lastNameEn,
                gender: dto.gender,
                nationalId: dto.nationalId,
                idCardImage: dto.idCardImage,
                address: dto.address,
                passport: dto.passport,
                passportImage: dto.passportImage,
                passportExpiry: dto.passportExpiry ? new Date(dto.passportExpiry) : null,
                visaNo: dto.visaNo,
                visaImage: dto.visaImage,
                visaExpiry: dto.visaExpiry ? new Date(dto.visaExpiry) : null,
                nationality: dto.nationality || 'ไทย',
                birthDate: dto.birthDate ? new Date(dto.birthDate) : null,
                position: dto.position,
                dailyWage: new Decimal(dto.dailyWage),
                hireDate: new Date(dto.hireDate),
                resignDate: dto.resignDate ? new Date(dto.resignDate) : null,
                signature: dto.signature,
                branchId: dto.branchId,
                userId: dto.userId,
                createdById,
            },
            include: {
                branch: { select: { id: true, code: true, name: true } },
            },
        });
    }

    async update(id: string, dto: UpdateEmployeeDto) {
        const employee = await this.prisma.employee.findUnique({
            where: { id },
        });

        if (!employee) {
            throw new NotFoundException('Employee not found');
        }

        // Check empCode uniqueness if changed
        if (dto.empCode && dto.empCode !== employee.empCode) {
            const existingEmpCode = await this.prisma.employee.findUnique({
                where: { empCode: dto.empCode },
            });
            if (existingEmpCode) {
                throw new ConflictException('Employee code already exists');
            }
        }

        // Check nationalId uniqueness if changed
        if (dto.nationalId && dto.nationalId !== employee.nationalId) {
            const existingNationalId = await this.prisma.employee.findUnique({
                where: { nationalId: dto.nationalId },
            });
            if (existingNationalId) {
                throw new ConflictException('National ID already exists');
            }
        }

        const updateData: any = {};
        if (dto.empCode !== undefined) updateData.empCode = dto.empCode;
        if (dto.title !== undefined) updateData.title = dto.title;
        if (dto.firstName !== undefined) updateData.firstName = dto.firstName;
        if (dto.lastName !== undefined) updateData.lastName = dto.lastName;
        if (dto.firstNameEn !== undefined) updateData.firstNameEn = dto.firstNameEn;
        if (dto.lastNameEn !== undefined) updateData.lastNameEn = dto.lastNameEn;
        if (dto.gender !== undefined) updateData.gender = dto.gender;
        if (dto.nationalId !== undefined) updateData.nationalId = dto.nationalId;
        if (dto.idCardImage !== undefined) updateData.idCardImage = dto.idCardImage;
        if (dto.address !== undefined) updateData.address = dto.address;
        if (dto.passport !== undefined) updateData.passport = dto.passport;
        if (dto.passportImage !== undefined) updateData.passportImage = dto.passportImage;
        if (dto.passportExpiry !== undefined) updateData.passportExpiry = dto.passportExpiry ? new Date(dto.passportExpiry) : null;
        if (dto.visaNo !== undefined) updateData.visaNo = dto.visaNo;
        if (dto.visaImage !== undefined) updateData.visaImage = dto.visaImage;
        if (dto.visaExpiry !== undefined) updateData.visaExpiry = dto.visaExpiry ? new Date(dto.visaExpiry) : null;
        if (dto.nationality !== undefined) updateData.nationality = dto.nationality;
        if (dto.birthDate !== undefined) updateData.birthDate = dto.birthDate ? new Date(dto.birthDate) : null;
        if (dto.position !== undefined) updateData.position = dto.position;
        if (dto.dailyWage !== undefined) updateData.dailyWage = new Decimal(dto.dailyWage);
        if (dto.hireDate !== undefined) updateData.hireDate = new Date(dto.hireDate);
        if (dto.resignDate !== undefined) updateData.resignDate = dto.resignDate ? new Date(dto.resignDate) : null;
        if (dto.signature !== undefined) updateData.signature = dto.signature;
        if (dto.branchId !== undefined) updateData.branchId = dto.branchId;
        if (dto.userId !== undefined) updateData.userId = dto.userId;
        if (dto.isActive !== undefined) updateData.isActive = dto.isActive;

        return this.prisma.employee.update({
            where: { id },
            data: updateData,
            include: {
                branch: { select: { id: true, code: true, name: true } },
            },
        });
    }

    async remove(id: string) {
        const employee = await this.prisma.employee.findUnique({
            where: { id },
        });

        if (!employee) {
            throw new NotFoundException('Employee not found');
        }

        // Soft delete
        return this.prisma.employee.update({
            where: { id },
            data: { isActive: false },
        });
    }
}
