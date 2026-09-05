import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { JWTPayloadType } from 'utils/type';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) { }

    /**
     * Register a new user
     * @param registerDto 
     * @returns JWT token and user object
     */
    public async register(registerDto: RegisterDto):
        Promise<{ accessToken: string; user: { id: string; firstName: string; lastName: string; email: string; }; }> {
        const user = await this.usersService.createUser(registerDto);

        const payload: JWTPayloadType = {
            sub: user.id,
            email: user.email,
        };

        const accessToken = this.jwtService.sign(payload);

        return {
            accessToken,
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
            },
        };
    }

    /**
     * Login a user
     * @param loginDto 
     * @returns JWT token and user object
     */
    public async login(loginDto: LoginDto) {
        const { email, password } = loginDto;

        const user = await this.usersService.findByEmail(email);

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload: JWTPayloadType = {
            sub: user.id,
            email: user.email,
        };

        const accessToken = this.jwtService.sign(payload);

        return {
            message: 'Login successful',
            accessToken: accessToken,
            user: {
                id: user.id,
                email: user.email,
            },
        };
    }
}
