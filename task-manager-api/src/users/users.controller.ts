import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthService } from 'src/auth/auth.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { AuthRolesGuard } from 'src/auth/guards/auth-role.guard';
import * as type from 'utils/type';
import { Roles } from 'src/auth/decorators/user-role.decorator';
import { Role } from 'utils/enum';

@Controller('api/users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        private readonly authService: AuthService
    ) { }

    // GET: ~/api/users
    @Get()
    // @UseGuards(AuthGuard, AuthRolesGuard)
    getAllUsers() {
        return this.usersService.getAllUsers();
    }
}
