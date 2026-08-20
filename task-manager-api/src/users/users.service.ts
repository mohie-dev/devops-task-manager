import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { RegisterDto } from './../auth/dtos/register.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) { }

  /**
   * Create a new user
   * @param registerDto 
   * @returns User object
   */
  public async createUser(registerDto: RegisterDto): Promise<User> {
    const { email, password, username } = registerDto;

    const existingUser = await this.usersRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = this.usersRepository.create({
      email,
      password: hashedPassword,
      username,
    });

    return this.usersRepository.save(user);
  }

  /**
   * Get all users
   * @returns Array of User objects
   */
  public async getAllUsers(): Promise<User[]> {
    return this.usersRepository.find();
  }

  /**
   * Find user by email
   * @param email 
   * @returns User object
   */
  public async findByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException(`User not found`);
    }
    return user;
  }

  /**
   * Get current user
   * @param id 
   * @returns User object
   */
  public async getCurrentUser(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User not found`);
    }
    return user;
  }
}
