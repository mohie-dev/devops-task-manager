import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service';
import * as type from 'utils/type';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CreateTaskDto } from './dtos/create-task.dto';

@Controller('api/tasks')
export class TasksController {
    constructor(
        private readonly tasksService: TasksService,
    ) { }

    // GET: ~/api/tasks
    @Get('/')
    @UseGuards(AuthGuard)
    getAllUserTasks(@CurrentUser() user: type.JWTPayloadType) {
        return this.tasksService.getAllUserTasks(user.sub);
    }

    // POST: ~/api/tasks
    @Post('/')
    @UseGuards(AuthGuard)
    createTask(@CurrentUser() user: type.JWTPayloadType, @Body() createTaskDto: CreateTaskDto) {
        return this.tasksService.createTask(user, createTaskDto);
    }
}
