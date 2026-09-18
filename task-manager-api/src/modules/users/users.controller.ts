import { Controller, Post, Body, Get, UseGuards, Patch } from '@nestjs/common';
import { UsersService } from './users.service';
import { ChangePasswordDto } from './dtos/change-password.dto';
import type { JWTPayloadType } from 'utils/type';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthGuard } from '../../common/guards/auth.guard';

@Controller('api/users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
    ) { }

    // GET: ~/api/users
    @Get()
    getAllUsers() {
        return this.usersService.getAllUsers();
    }

    // PATCH: ~/api/users/me/password
    @Patch('/me/password')
    @UseGuards(AuthGuard)
    changePassword(
        @CurrentUser() user: JWTPayloadType,
        @Body() changePasswordDto: ChangePasswordDto,
    ) {
        return this.usersService.changePassword(
            user.sub,
            changePasswordDto.currentPassword,
            changePasswordDto.newPassword,
        );
    }
}
