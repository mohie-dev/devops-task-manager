import { IsEmail, IsEnum, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";
import { TaskPriority, TaskStatus } from "utils/enum";


export class CreateTaskDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(100)
    title: string;

    @IsString()
    @MaxLength(500)
    description?: string;

    @IsEnum(TaskStatus)
    status?: TaskStatus;

    @IsEnum(TaskPriority)
    priority?: TaskPriority;
}