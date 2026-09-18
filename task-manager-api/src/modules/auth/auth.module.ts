import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { User } from '../users/entities/user.entity';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { SessionsModule } from '../sessions/sessions.module';
import { CommonModule } from '../../common/common.module';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { PasswordResetTokensService } from './password-reset-tokens.service';
import { EmailVerificationToken } from './entities/email-verification-token.entity';
import { EmailVerificationTokensService } from './email-verification-tokens.service';
import { GoogleStrategy } from './strategies/google.strategy';
import { MailModule } from '../emails/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, PasswordResetToken, EmailVerificationToken]),
    forwardRef(() => UsersModule),
    CommonModule,
    SessionsModule,
    MailModule
  ],
  providers: [AuthService, PasswordResetTokensService, GoogleStrategy, EmailVerificationTokensService],
  controllers: [AuthController],
  exports: [AuthService, TypeOrmModule],
})
export class AuthModule { }