import {
    Controller,
    Post,
    Body,
    Get,
    UseGuards,
    Req,
    UseInterceptors,
    HttpStatus,
    HttpCode,
    Query
} from '@nestjs/common';
import type { Request } from 'express';
import { RegisterDto } from './dtos/register.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { CurrentUser } from './decorators/current-user.decorator';
import * as type from 'utils/type';
import { AuthGuard } from '../common/guards/auth.guard';
import { UsersService } from 'src/users/users.service';
import { SetCookieInterceptor } from '../common/interceptors/set-cookie.interceptor';
import { ClearCookieInterceptor } from '../common/interceptors/clear-cookie.interceptor';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { GoogleAuthGuard } from 'src/common/guards/google-auth.guard';
import { ResendVerificationDto } from './dtos/resend-verification.dto';

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

    // POST ~/api/auth/google
    @Get('google')
    @UseGuards(GoogleAuthGuard)
    googleLogin() { }

    // POST ~/api/auth/google/callback
    @Get('google/callback')
    @UseGuards(GoogleAuthGuard)
    @UseInterceptors(SetCookieInterceptor)
    googleCallback(@Req() req: Request) {
        return this.authService.googleLogin(
            req.user as type.GoogleProfileType,
            req.headers['user-agent'],
            req.ip,
        );
    }

    // GET ~/api/auth/verify-email
    @Get('/verify-email')
    public async verifyEmail(@Query('token') token: string) {
        await this.authService.verifyEmail(token);

        return {
            message: 'Email verified successfully',
        };
    }

    // POST ~/api/auth/resend-verification
    @Post('resend-verification')
    public async resendVerification(
        @Body() resendVerificationDto: ResendVerificationDto,
    ) {
        await this.authService.resendVerificationEmail(
            resendVerificationDto,
        );
        return {
            message: 'If the email exists, a verification email will be sent',
        };
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

    // POST ~/api/auth/forgot-password
    @Post('/forgot-password')
    forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
        return this.authService.forgotPassword(forgotPasswordDto.email);
    }

    /**
     * Reset Password
     *
     * Resets a user's password using a valid password reset token.
     *
     * Flow:
     * 1. Receive reset token and new password.
     * 2. Validate the reset token.
     * 3. Update the user's password.
     * 4. Revoke all active refresh sessions.
     * 5. Mark the reset token as used.
    */
    // POST ~/api/auth/reset-password
    @Post('/reset-password')
    @HttpCode(HttpStatus.OK)
    resetPassword(
        @Body() resetPasswordDto: ResetPasswordDto,
    ) {
        return this.authService.resetPassword(resetPasswordDto);
    }

    // GET ~/api/auth/me
    @Get('/me')
    @UseGuards(AuthGuard)
    public async me(@CurrentUser() user: type.JWTPayloadType) {
        return this.usersService.getCurrentUser(user.sub);
    }
}