import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { User } from 'src/users/entities/user.entity';
import { UsersModule } from 'src/users/users.module';
import { AuthController } from './auth.controller';
import { SessionsModule } from 'src/sessions/sessions.module';
import { CommonModule } from 'src/common/common.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        CommonModule,
        forwardRef(() => UsersModule),
        SessionsModule,
    ],
    providers: [AuthService],
    controllers: [AuthController],
    exports: [AuthService, TypeOrmModule],
})
export class AuthModule {}