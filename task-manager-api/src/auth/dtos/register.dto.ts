import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class RegisterDto {
    @IsEmail()
    @MaxLength(150)
    @IsNotEmpty()
    email: string;

    @MinLength(3)
    @IsNotEmpty()
    username: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    password: string;
}