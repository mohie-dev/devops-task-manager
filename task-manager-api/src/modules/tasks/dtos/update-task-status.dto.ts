import { IsEnum, IsNotEmpty } from 'class-validator';
import { TaskStatus } from 'utils/enum';

export class UpdateTaskStatusDto {
  @IsNotEmpty()
  @IsEnum(TaskStatus)
  status: TaskStatus;
}