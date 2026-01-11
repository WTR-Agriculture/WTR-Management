import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    UseGuards,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto, UpdateRoleDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@Controller('roles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RolesController {
    constructor(private readonly rolesService: RolesService) { }

    @Get()
    @RequirePermissions('roles.view')
    findAll() {
        return this.rolesService.findAll();
    }

    @Get('permissions')
    @RequirePermissions('roles.view')
    getAllPermissions() {
        return this.rolesService.getAllPermissions();
    }

    @Get(':id')
    @RequirePermissions('roles.view')
    findOne(@Param('id') id: string) {
        return this.rolesService.findOne(id);
    }

    @Post()
    @RequirePermissions('roles.create')
    create(@Body() dto: CreateRoleDto) {
        return this.rolesService.create(dto);
    }

    @Patch(':id')
    @RequirePermissions('roles.edit')
    update(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
        return this.rolesService.update(id, dto);
    }

    @Delete(':id')
    @RequirePermissions('roles.delete')
    remove(@Param('id') id: string) {
        return this.rolesService.remove(id);
    }
}
