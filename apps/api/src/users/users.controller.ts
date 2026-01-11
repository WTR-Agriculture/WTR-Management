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
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, UserQueryDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    @RequirePermissions('users.view')
    findAll(@Query() query: UserQueryDto) {
        return this.usersService.findAll(query);
    }

    @Get(':id')
    @RequirePermissions('users.view')
    findOne(@Param('id') id: string) {
        return this.usersService.findOne(id);
    }

    @Post()
    @RequirePermissions('users.create')
    create(@Body() dto: CreateUserDto) {
        return this.usersService.create(dto);
    }

    @Patch(':id')
    @RequirePermissions('users.edit')
    update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
        return this.usersService.update(id, dto);
    }

    @Delete(':id')
    @RequirePermissions('users.delete')
    remove(@Param('id') id: string) {
        return this.usersService.remove(id);
    }
}
