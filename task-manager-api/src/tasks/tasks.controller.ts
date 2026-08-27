import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CreateTaskDto } from './dtos/create-task.dto';
import { UpdateTaskDto } from './dtos/update-task.dto';
import { UpdateTaskStatusDto } from './dtos/update-task-status.dto';
import type { JWTPayloadType } from 'utils/type';
import { Task } from './entities/task.entity';

@Controller('api/tasks')
@UseGuards(AuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  /**
   * GET /api/tasks
   * Retrieve all tasks belonging to the current user
   */
  @Get()
  public async getAllUserTasks(
    @CurrentUser() user: JWTPayloadType,
  ): Promise<Task[]> {
    return this.tasksService.getAllUserTasks(user.sub);
  }

  /**
   * GET /api/tasks/:id
   * Retrieve a specific task by ID
   */
  @Get(':id')
  public async getTaskById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JWTPayloadType,
  ): Promise<Task> {
    return this.tasksService.getTaskById(id, user.sub);
  }

  /**
   * POST /api/tasks
   * Create a new task for the current user
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  public async createTask(
    @CurrentUser() user: JWTPayloadType,
    @Body() createTaskDto: CreateTaskDto,
  ): Promise<Task> {
    return this.tasksService.createTask(user, createTaskDto);
  }

  /**
   * PATCH /api/tasks/:id
   * Update task details (title, description, priority, etc.)
   */
  @Patch(':id')
  public async updateTask(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JWTPayloadType,
    @Body() updateTaskDto: UpdateTaskDto,
  ): Promise<Task> {
    return this.tasksService.updateTask(id, user.sub, updateTaskDto);
  }

  /**
   * PATCH /api/tasks/:id/status
   * Update only the status of a specific task
   */
  @Patch(':id/status')
  public async updateTaskStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JWTPayloadType,
    @Body() updateTaskStatusDto: UpdateTaskStatusDto,
  ): Promise<Task> {
    return this.tasksService.updateTaskStatus(
      id,
      user.sub,
      updateTaskStatusDto.status,
    );
  }

  /**
   * DELETE /api/tasks/:id
   * Delete a task by ID
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async deleteTask(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JWTPayloadType,
  ): Promise<void> {
    await this.tasksService.deleteTask(id, user.sub);
  }
}