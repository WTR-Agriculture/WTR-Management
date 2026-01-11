import { IsEmail, IsString, IsOptional, MinLength, IsUUID } from 'class-validator';

export class CreateUserDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsString()
    name: string;

    @IsUUID()
    roleId: string;

    @IsOptional()
    @IsString()
    signature?: string;
}

export class UpdateUserDto {
    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    @MinLength(6)
    password?: string;

    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsUUID()
    roleId?: string;

    @IsOptional()
    @IsString()
    signature?: string;

    @IsOptional()
    isActive?: boolean;
}

export class UserQueryDto {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    page?: number;

    @IsOptional()
    limit?: number;
}
