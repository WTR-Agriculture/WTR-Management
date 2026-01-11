import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    Request,
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto, UpdateEmployeeDto, EmployeeQueryDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@Controller('employees')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class EmployeesController {
    constructor(private readonly employeesService: EmployeesService) { }

    @Get()
    @RequirePermissions('settings.view')
    findAll(@Query() query: EmployeeQueryDto) {
        return this.employeesService.findAll(query);
    }

    @Get(':id')
    @RequirePermissions('settings.view')
    findOne(@Param('id') id: string) {
        return this.employeesService.findOne(id);
    }

    @Post()
    @RequirePermissions('settings.edit')
    create(@Body() dto: CreateEmployeeDto, @Request() req: any) {
        return this.employeesService.create(dto, req.user?.id);
    }

    @Patch(':id')
    @RequirePermissions('settings.edit')
    update(@Param('id') id: string, @Body() dto: UpdateEmployeeDto) {
        return this.employeesService.update(id, dto);
    }

    @Delete(':id')
    @RequirePermissions('settings.edit')
    remove(@Param('id') id: string) {
        return this.employeesService.remove(id);
    }
}
