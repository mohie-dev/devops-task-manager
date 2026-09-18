import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { RegisterDto } from './../auth/dtos/register.dto';
import { SessionsService } from '../sessions/sessions.service';
import { AuthProvider } from 'utils/enum';
import { GoogleProfileType } from 'utils/type';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { S3Service } from '../files/s3.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly sessionsService: SessionsService,
    private readonly s3Service: S3Service
  ) { }

  /**
   * Create a new user
   */
  public async createUser(registerDto: RegisterDto): Promise<User> {
    const {
      firstName,
      lastName,
      email,
      password,
    } = registerDto;

    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = this.usersRepository.create({
      firstName,
      lastName,
      email,
      passwordHash,
    });

    return this.usersRepository.save(user);
  }

  public async createGoogleUser(
    googleProfile: GoogleProfileType,
  ): Promise<User> {
    const user = this.usersRepository.create({
      firstName: googleProfile.firstName,
      lastName: googleProfile.lastName,
      email: googleProfile.email,
      passwordHash: null,
      avatar: googleProfile.avatar,
      provider: AuthProvider.GOOGLE,
      providerId: googleProfile.providerId,
      isEmailVerified: googleProfile.isEmailVerified,
      isActive: true,
    });

    return this.usersRepository.save(user);
  }

  /**
   * Get all users
   */
  public async getAllUsers(): Promise<User[]> {
    return this.usersRepository.find();
  }

  /**
   * Update user profile details
   */
  public async updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<User> {
    const user = await this.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.usersRepository.update(userId, updateProfileDto);

    const updatedUser = await this.findById(userId);

    if (!updatedUser) {
      throw new NotFoundException('User not found after update');
    }

    return updatedUser;
  }

  /**
   * Find user by email
   */
  public async findByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Find user by ID
   */
  public async findById(
    userId: string,
    manager?: EntityManager,
  ): Promise<User | null> {
    const repository = manager
      ? manager.getRepository(User)
      : this.usersRepository;

    return repository.findOne({
      where: { id: userId },
    });
  }

  /**
   * Get current user
   */
  public async getCurrentUser(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Update last login timestamp for a user
   */
  public async updateLastLoginAt(userId: string): Promise<void> {
    await this.usersRepository.update(userId, {
      lastLoginAt: new Date(),
    });
  }

  /**
   * Change password for a user
   */
  public async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.passwordHash) {
      throw new BadRequestException(
        'Password change is not available for this account',
      );
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.passwordHash,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await this.usersRepository.update(userId, {
      passwordHash,
    });

    await this.sessionsService.revokeAllUserSessions(userId);
  }

  /**
   * Update password for a user (used in password reset flow)
   */
  public async updatePassword(
    userId: string,
    passwordHash: string,
    manager?: EntityManager,
  ): Promise<void> {
    const repository = manager
      ? manager.getRepository(User)
      : this.usersRepository;

    await repository.update(userId, {
      passwordHash,
    });
  }

  /**
   * Find user by email for password reset (Specifically for the forgot password flow)
   */
  public async findByEmailForPasswordReset(
    email: string,
  ): Promise<User | null> {
    return this.usersRepository.findOne({
      where: {
        email,
      },
    });
  }

  public async findByProviderId(
    provider: AuthProvider,
    providerId: string,
  ): Promise<User | null> {
    return this.usersRepository.findOne({
      where: {
        provider,
        providerId,
      },
    });
  }

  public async uploadAvatar(userId: string, file: Express.Multer.File): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.avatar) {
      await this.s3Service.deleteFile(user.avatar);
    }

    const avatarUrl = await this.s3Service.uploadFile(file, 'users-avatars');

    await this.usersRepository.update(userId, { avatar: avatarUrl });

    const updatedUser = await this.findById(userId);
    if (!updatedUser) throw new NotFoundException('User not found after update');

    return updatedUser;
  }

  /**
   * Deactivate user account (Soft Delete alternative)
   */
  public async deactivateAccount(userId: string): Promise<void> {
    const user = await this.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.usersRepository.update(userId, { isActive: false });

    await this.sessionsService.revokeAllUserSessions(userId);
  }
}


/**
 * TODO:
- Rename findByEmailForPasswordReset → generic method
- Actual email provider
- Email template
- Verification URL
- Cleanup expired tokens / scheduled job
- Rate limiting على resend-verification
- Proper Google email verification hardening
 */