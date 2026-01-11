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
} from '@nestjs/common';
import { BranchesService } from './branches.service';
import { CreateBranchDto, UpdateBranchDto, BranchQueryDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@Controller('branches')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class BranchesController {
    constructor(private readonly branchesService: BranchesService) { }

    @Get()
    @RequirePermissions('settings.view')
    findAll(@Query() query: BranchQueryDto) {
        return this.branchesService.findAll(query);
    }

    @Get(':id')
    @RequirePermissions('settings.view')
    findOne(@Param('id') id: string) {
        return this.branchesService.findOne(id);
    }

    @Post()
    @RequirePermissions('settings.edit')
    create(@Body() dto: CreateBranchDto) {
        return this.branchesService.create(dto);
    }

    @Patch(':id')
    @RequirePermissions('settings.edit')
    update(@Param('id') id: string, @Body() dto: UpdateBranchDto) {
        return this.branchesService.update(id, dto);
    }

    @Delete(':id')
    @RequirePermissions('settings.edit')
    remove(@Param('id') id: string) {
        return this.branchesService.remove(id);
    }
}
