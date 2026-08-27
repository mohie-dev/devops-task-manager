import { IsEnum, IsOptional, IsString, MaxLength } from "class-validator";
import { TaskPriority, TaskStatus } from "utils/enum";


export class UpdateTaskDto {
    @IsOptional()
    @IsString()
    @MaxLength(100)
    title?: string;

    @IsString()
    @IsOptional()
    @MaxLength(500)
    description?: string;

    @IsEnum(TaskStatus)
    @IsOptional()
    status?: TaskStatus;

    @IsEnum(TaskPriority)
    @IsOptional()
    priority?: TaskPriority;
}