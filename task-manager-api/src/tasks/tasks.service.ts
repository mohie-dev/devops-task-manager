import { Injectable } from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm';
import * as type from 'utils/type';
import { Repository } from 'typeorm';
import { Task } from "./entities/task.entity";
import { CreateTaskDto } from "./dtos/create-task.dto";


@Injectable()
export class TasksService {
    constructor(
        @InjectRepository(Task)
        private readonly tasksRepository: Repository<Task>,
    ) { }

    /**
     * Get all tasks for a specific user
     * @param userId 
     * @returns
     */
    public async getAllUserTasks(userId: string): Promise<{ message: string; tasks: Task[] }> {
        const tasks = await this.tasksRepository.find({ where: { user: { id: userId } } });
        return {
            message: 'Tasks retrieved successfully',
            tasks: tasks,
        };
    }

    /**
     * Create a new task for a specific user
     * @param createTaskDto 
     * @returns
     */
    public async createTask(user: type.JWTPayloadType, createTaskDto: CreateTaskDto): Promise<{ message: string; task: Task }> {
        const task = this.tasksRepository.create({ ...createTaskDto, user: { id: user.sub } });
        const savedTask = await this.tasksRepository.save(task);
        return {
            message: 'Task created successfully',
            task: savedTask,
        };
    }
}