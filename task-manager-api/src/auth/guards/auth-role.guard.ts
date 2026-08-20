
import { 
    Injectable, 
    CanActivate, 
    ExecutionContext,  
    UnauthorizedException
 } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { JWTPayloadType } from 'utils/type';
import { Reflector } from '@nestjs/core';
import { Role } from 'utils/enum';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthRolesGuard implements CanActivate {

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,
    private readonly usersService: UsersService
  ) { }

  async canActivate(
    context: ExecutionContext
  ) {

    const roles: Role[] = this.reflector.getAllAndOverride('roles', [context.getHandler(), context.getClass()])

    if (!roles || roles.length === 0) return false

    const request: Request = context.switchToHttp().getRequest();
    const [type, token] = request.headers.authorization?.split(' ') ?? [];

    if (token && type === 'Bearer') {

      try {

        const payload: JWTPayloadType = await this.jwtService.verifyAsync(
          token,
          {
            secret: this.configService.get<string>('JWT_SECRET'),
          }
        )

        const user = await this.usersService.findByEmail(payload.email)
        if (!user) return false

        if(roles.includes(user.role)) {
            request['user'] = payload;
            return true
        }

        request['user'] = payload
      } catch (err) {
        throw new UnauthorizedException("Access denied, Invalid Token")
      }

    } else {
      throw new UnauthorizedException("Access denied, No Token Provided")
    }

    return false
  }
}
