import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { RegisterDto } from './dtos/register.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { CurrentUser } from './decorators/current-user.decorator';
import * as type from 'utils/type';
import { AuthGuard } from './guards/auth.guard';
import { UsersService } from 'src/users/users.service';
import { AuthRolesGuard } from './guards/auth-role.guard';

@Controller('api/auth')
export class AuthController {
    constructor(
        private readonly usersService: UsersService,
        private readonly authService: AuthService
    ) { }

    // POST: ~/api/auth/register
    @Post('/register')
    register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    // POST: ~/api/auth/login
    @Post('/login')
    login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    // GET: ~/api/auth/me
    @Get('/me')
    @UseGuards(AuthGuard)
    me(@CurrentUser() user: type.JWTPayloadType) {
        return this.usersService.getCurrentUser(user.sub);
    }
}
