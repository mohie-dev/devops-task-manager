import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { SessionsModule } from '../sessions/sessions.module';
import { CommonModule } from '../../common/common.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        SessionsModule,
        CommonModule,
    ],
    providers: [UsersService],
    controllers: [UsersController],
    exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}