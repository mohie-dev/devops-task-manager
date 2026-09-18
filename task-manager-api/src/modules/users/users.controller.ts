import { Controller, Post, Body, Get, UseGuards, Patch, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { ChangePasswordDto } from './dtos/change-password.dto';
import type { JWTPayloadType } from 'utils/type';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthGuard } from '../../common/guards/auth.guard';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { FileInterceptor } from '@nestjs/platform-express';

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

    // PATCH: ~/api/users/me
    @Patch('/me')
    @UseGuards(AuthGuard)
    updateProfile(
        @CurrentUser() user: JWTPayloadType,
        @Body() updateProfileDto: UpdateProfileDto,
    ) {
        return this.usersService.updateProfile(user.sub, updateProfileDto);
    }

    // POST: ~/api/users/me/avatar
    @Post('/me/avatar')
    @UseGuards(AuthGuard)
    @UseInterceptors(FileInterceptor('file'))
    async uploadAvatar(
        @CurrentUser() user: JWTPayloadType,
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 }),
                    new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
                ],
            }),
        )
        file: Express.Multer.File,
    ) {
        return this.usersService.uploadAvatar(user.sub, file);
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

    // DELETE: ~/api/users/me
    @Delete('/me')
    @UseGuards(AuthGuard)
    async deactivateAccount(@CurrentUser() user: JWTPayloadType) {
        await this.usersService.deactivateAccount(user.sub);
        return { message: 'Account deactivated successfully. We are sorry to see you go!' };
    }
}
