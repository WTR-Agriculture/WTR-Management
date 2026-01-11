import { IsString, IsOptional, IsBoolean, IsInt, Min, IsDateString, IsDecimal, IsEnum, IsNumber } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateEmployeeDto {
    @IsString()
    empCode: string;

    @IsString()
    title: string;

    @IsString()
    firstName: string;

    @IsString()
    lastName: string;

    @IsOptional()
    @IsString()
    firstNameEn?: string;

    @IsOptional()
    @IsString()
    lastNameEn?: string;

    @IsString()
    gender: string;

    @IsOptional()
    @IsString()
    nationalId?: string;

    @IsOptional()
    @IsString()
    idCardImage?: string;

    @IsOptional()
    @IsString()
    passport?: string;

    @IsOptional()
    @IsString()
    passportImage?: string;

    @IsOptional()
    @IsDateString()
    passportExpiry?: string;

    @IsOptional()
    @IsString()
    visaNo?: string;

    @IsOptional()
    @IsString()
    visaImage?: string;

    @IsOptional()
    @IsDateString()
    visaExpiry?: string;

    @IsOptional()
    @IsString()
    nationality?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsDateString()
    birthDate?: string;

    @IsString()
    position: string;

    @Type(() => Number)
    @IsNumber()
    dailyWage: number;

    @IsDateString()
    hireDate: string;

    @IsOptional()
    @IsDateString()
    resignDate?: string;

    @IsOptional()
    @IsString()
    signature?: string;

    @IsString()
    branchId: string;

    @IsOptional()
    @IsString()
    userId?: string;
}

export class UpdateEmployeeDto {
    @IsOptional()
    @IsString()
    empCode?: string;

    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    firstName?: string;

    @IsOptional()
    @IsString()
    lastName?: string;

    @IsOptional()
    @IsString()
    firstNameEn?: string;

    @IsOptional()
    @IsString()
    lastNameEn?: string;

    @IsOptional()
    @IsString()
    gender?: string;

    @IsOptional()
    @IsString()
    nationalId?: string;

    @IsOptional()
    @IsString()
    idCardImage?: string;

    @IsOptional()
    @IsString()
    passport?: string;

    @IsOptional()
    @IsString()
    passportImage?: string;

    @IsOptional()
    @IsDateString()
    passportExpiry?: string;

    @IsOptional()
    @IsString()
    visaNo?: string;

    @IsOptional()
    @IsString()
    visaImage?: string;

    @IsOptional()
    @IsDateString()
    visaExpiry?: string;

    @IsOptional()
    @IsString()
    nationality?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsDateString()
    birthDate?: string;

    @IsOptional()
    @IsString()
    position?: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    dailyWage?: number;

    @IsOptional()
    @IsDateString()
    hireDate?: string;

    @IsOptional()
    @IsDateString()
    resignDate?: string;

    @IsOptional()
    @IsString()
    signature?: string;

    @IsOptional()
    @IsString()
    branchId?: string;

    @IsOptional()
    @IsString()
    userId?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

export class EmployeeQueryDto {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsString()
    branchId?: string;

    @IsOptional()
    @Transform(({ value }) => value === 'true')
    @IsBoolean()
    includeInactive?: boolean;

    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsInt()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsInt()
    @Min(1)
    limit?: number = 20;
}
