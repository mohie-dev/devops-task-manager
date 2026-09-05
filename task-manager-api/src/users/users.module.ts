import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { AuthModule } from 'src/auth/auth.module';
import { RefreshSession } from 'src/sessions/entities/refresh-session.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, RefreshSession]),
        forwardRef(() => AuthModule),
    ],
    providers: [UsersService],
    controllers: [UsersController],
    exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}