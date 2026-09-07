import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { User } from 'src/users/entities/user.entity';
import { UsersModule } from 'src/users/users.module';
import { AuthController } from './auth.controller';
import { SessionsModule } from 'src/sessions/sessions.module';
import { CommonModule } from 'src/common/common.module';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { PasswordResetTokensService } from './password-reset-tokens.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, PasswordResetToken]),
    CommonModule,
    forwardRef(() => UsersModule),
    SessionsModule,
  ],
  providers: [AuthService, PasswordResetTokensService],
  controllers: [AuthController],
  exports: [AuthService, TypeOrmModule],
})
export class AuthModule { }