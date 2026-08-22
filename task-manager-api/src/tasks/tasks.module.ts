import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { Task } from './entities/task.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task]),
    forwardRef(() => AuthModule),
  ],
  providers: [TasksService],
  controllers: [TasksController],
  exports: [TasksService, TypeOrmModule],
})
export class TasksModule { }
