import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthService } from 'src/auth/auth.service';

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
