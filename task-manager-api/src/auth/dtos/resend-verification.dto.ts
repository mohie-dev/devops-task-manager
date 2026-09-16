import {
    IsEmail,
    IsNotEmpty,
    IsString,
    MaxLength,
} from 'class-validator';

export class ResendVerificationDto {
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    @MaxLength(255)
    email: string;
}