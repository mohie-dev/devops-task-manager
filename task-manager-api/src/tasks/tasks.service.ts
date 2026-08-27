import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { TaskStatus } from 'utils/enum';
import { CreateTaskDto } from './dtos/create-task.dto';
import { UpdateTaskDto } from './dtos/update-task.dto';
import { JWTPayloadType } from 'utils/type';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,
  ) {}

  /**
   * Fetch all tasks owned by a specific user
   */
  public async getAllUserTasks(userId: string): Promise<Task[]> {
    return this.tasksRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Create and persist a new task
   */
  public async createTask(
    user: JWTPayloadType,
    createTaskDto: CreateTaskDto,
  ): Promise<Task> {
    const task = this.tasksRepository.create({
      ...createTaskDto,
      user: { id: user.sub },
    });

    return this.tasksRepository.save(task);
  }

  /**
   * Get single task by ID and verify ownership
   */
  public async getTaskById(taskId: string, userId: string): Promise<Task> {
    const task = await this.tasksRepository.findOne({
      where: { id: taskId, user: { id: userId } },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID "${taskId}" not found`);
    }

    return task;
  }

  /**
   * Update task fields safely using preload or standard update
   */
  public async updateTask(
    taskId: string,
    userId: string,
    updateTaskDto: UpdateTaskDto,
  ): Promise<Task> {

    const task = await this.getTaskById(taskId, userId);

    Object.assign(task, updateTaskDto);

    return this.tasksRepository.save(task);
  }

  /**
   * Update only the task status
   */
  public async updateTaskStatus(
    taskId: string,
    userId: string,
    status: TaskStatus,
  ): Promise<Task> {
    const task = await this.getTaskById(taskId, userId);
    
    task.status = status;
    
    return this.tasksRepository.save(task);
  }

  /**
   * Delete a task by ID safely
   */
  public async deleteTask(taskId: string, userId: string): Promise<void> {
    const task = await this.getTaskById(taskId, userId);
    
    await this.tasksRepository.remove(task);
  }
}