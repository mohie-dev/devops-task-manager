import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes, createHash } from 'crypto';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { JWTPayloadType } from 'utils/type';
import { UsersService } from 'src/users/users.service';
import { SessionsService } from 'src/sessions/sessions.service';
import { User } from 'src/users/entities/user.entity';
import { PasswordResetTokensService } from './password-reset-tokens.service';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { DataSource } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly sessionsService: SessionsService,
    private readonly passwordResetTokensService: PasswordResetTokensService,
    private readonly dataSource: DataSource,
  ) { }

  /**
   * Register a new user
   * @param registerDto
   * @param userAgent
   * @param ipAddress
   * @returns
   */
  public async register(
    registerDto: RegisterDto,
    userAgent?: string,
    ipAddress?: string,
  ) {
    const user = await this.usersService.createUser(registerDto);
    return this.generateTokensAndSession(user, userAgent, ipAddress);
  }

  /**
   * Log in a user
   * @param loginDto
   * @param userAgent
   * @param ipAddress
   * @returns
   */
  public async login(
    loginDto: LoginDto,
    userAgent?: string,
    ipAddress?: string,
  ) {
    const { email, password } = loginDto;
    const user = await this.usersService.findByEmail(email);

    if (!user || !user.passwordHash || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.usersService.updateLastLoginAt(user.id);
    return this.generateTokensAndSession(user, userAgent, ipAddress);
  }

  /**
   * Refresh the access token using a valid refresh token
   * @param refreshToken
   * @param userAgent
   * @param ipAddress
   * @returns
   */
  public async refresh(
    refreshToken: string,
    userAgent?: string,
    ipAddress?: string,
  ) {

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not provided');
    }

    const tokenHash = this.hashRefreshToken(refreshToken);

    const session = await this.sessionsService.findByTokenHash(tokenHash);

    if (!session) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (session.revokedAt) {
      throw new UnauthorizedException('Refresh token has been revoked');
    }

    if (session.expiresAt <= new Date()) {
      throw new UnauthorizedException('Refresh token has expired');
    }

    const user = session.user;

    if (!user.isActive) {
      throw new UnauthorizedException('User account is inactive');
    }

    await this.sessionsService.revokeSession(session.id);

    return this.generateTokensAndSession(
      user,
      userAgent,
      ipAddress,
    );
  }

  /** 
   * Logout the user by revoking the refresh token
   */
  public async logout(refreshToken: string): Promise<{ message: string }> {
    if (!refreshToken) {
      return { message: 'Logged out successfully' };
    }

    const tokenHash = this.hashRefreshToken(refreshToken);

    const session =
      await this.sessionsService.findByTokenHash(tokenHash);

    if (session && !session.revokedAt) {
      await this.sessionsService.revokeSession(session.id);
    }

    return {
      message: 'Logged out successfully',
    };
  }

  /**
   * Initiates the forgot password process by generating a reset token and saving it
   */
  public async forgotPassword(email: string): Promise<void> {
    const user = await this.usersService.findByEmailForPasswordReset(email);

    console.log('FORGOT PASSWORD CALLED');
    console.log('EMAIL:', email);

    if (!user) {
      // For security reasons, we don't reveal whether the email exists or not
      console.log('User not found for email:', email);
      return;
    }

    const resetToken = randomBytes(32).toString('hex');

    const tokenHash = createHash('sha256')
      .update(resetToken)
      .digest('hex');

    const expiresAt = new Date(
      Date.now() + 15 * 60 * 1000,
    );

    await this.passwordResetTokensService.createToken(
      user.id,
      tokenHash,
      expiresAt,
    );

    // TODO: Send reset email
    console.log('RESET TOKEN:', resetToken);
  }

  /**
 * Resets the user's password using a valid password reset token.
 *
 * The reset token must be valid, unused, and not expired.
 * After changing the password, all active refresh sessions are revoked.
 */
  public async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<void> {
    const { token, newPassword } = resetPasswordDto;

    const tokenHash = createHash('sha256')
      .update(token)
      .digest('hex');

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await this.dataSource.transaction(async (manager) => {
      // 1. Lock and validate reset token
      const resetToken =
        await this.passwordResetTokensService.findValidToken(
          tokenHash,
          manager,
        );

      if (!resetToken) {
        throw new UnauthorizedException(
          'Invalid or expired password reset token',
        );
      }

      // 2. Load user using the same transaction manager
      const user = await this.usersService.findById(
        resetToken.userId,
        manager,
      );

      if (!user) {
        throw new UnauthorizedException(
          'Invalid password reset request',
        );
      }

      if (!user.isActive) {
        throw new UnauthorizedException(
          'User account is inactive',
        );
      }

      // 3. Update password
      await this.usersService.updatePassword(
        user.id,
        passwordHash,
        manager,
      );

      // 4. Revoke all refresh sessions
      await this.sessionsService.revokeAllUserSessions(
        user.id,
        manager,
      );

      // 5. Mark reset token as used
      await this.passwordResetTokensService.markAsUsed(
        resetToken.id,
        manager,
      );
    });
  }

  /**
   * Helper function to issue Access Token + Refresh Token and save Session
   */
  private async generateTokensAndSession(
    user: User,
    userAgent?: string,
    ipAddress?: string,
  ) {
    const payload: JWTPayloadType = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    const refreshToken = this.generateRefreshToken();
    const refreshTokenHash = this.hashRefreshToken(refreshToken);
    const refreshTokenExpiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000,
    );

    await this.sessionsService.createSession({
      userId: user.id,
      tokenHash: refreshTokenHash,
      expiresAt: refreshTokenExpiresAt,
      userAgent: userAgent ?? null,
      ipAddress: ipAddress ?? null,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    };
  }

  private generateRefreshToken(): string {
    return randomBytes(64).toString('hex');
  }

  private hashRefreshToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}