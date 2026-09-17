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
import { EmailVerificationToken } from './entities/email-verification-token.entity';
import { EmailVerificationTokensService } from './email-verification-tokens.service';
import { GoogleStrategy } from './strategies/google.strategy';
import { MailModule } from 'src/emails/mail.module';

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