import { Controller, Post, Body, Get, UseGuards, Req, UseInterceptors } from '@nestjs/common';
import type { Request } from 'express';
import { RegisterDto } from './dtos/register.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { CurrentUser } from './decorators/current-user.decorator';
import * as type from 'utils/type';
import { AuthGuard } from './guards/auth.guard';
import { UsersService } from 'src/users/users.service';
import { SetCookieInterceptor } from '../common/interceptors/set-cookie.interceptor';
import { ClearCookieInterceptor } from '../common/interceptors/clear-cookie.interceptor';

@Controller('api/auth')
export class AuthController {
    constructor(
        private readonly usersService: UsersService,
        private readonly authService: AuthService,
    ) { }

    // POST ~/api/auth/register
    @Post('/register')
    @UseInterceptors(SetCookieInterceptor)
    public async register(@Body() registerDto: RegisterDto, @Req() req: Request) {
        return this.authService.register(
            registerDto,
            req.headers['user-agent'],
            req.ip,
        );
    }

    // POST ~/api/auth/login
    @Post('/login')
    @UseInterceptors(SetCookieInterceptor)
    public async login(@Body() loginDto: LoginDto, @Req() req: Request) {
        return this.authService.login(
            loginDto,
            req.headers['user-agent'],
            req.ip,
        );
    }

    // POST ~/api/auth/refresh
    @Post('/refresh')
    @UseInterceptors(SetCookieInterceptor)
    refresh(@Req() req: Request) {
        return this.authService.refresh(
            req.cookies.refreshToken,
            req.headers['user-agent'],
            req.ip,
        );
    }

    // POST ~/api/auth/logout
    @Post('/logout')
    @UseInterceptors(ClearCookieInterceptor)
    logout(@Req() req: Request) {
        return this.authService.logout(
            req.cookies.refreshToken,
        );
    }

    // GET ~/api/auth/me
    @Get('/me')
    @UseGuards(AuthGuard)
    public async me(@CurrentUser() user: type.JWTPayloadType) {
        return this.usersService.getCurrentUser(user.sub);
    }
}