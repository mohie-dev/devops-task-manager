import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { RegisterDto } from './../auth/dtos/register.dto';
import { SessionsService } from 'src/sessions/sessions.service';
import { ChangePasswordDto } from './dtos/change-password.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly sessionsService: SessionsService,
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

  /**
   * Get all users
   */
  public async getAllUsers(): Promise<User[]> {
    return this.usersRepository.find();
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
   * @param userId
   * @param currentPassword
   * @param newPassword
   */
  public async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
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
}