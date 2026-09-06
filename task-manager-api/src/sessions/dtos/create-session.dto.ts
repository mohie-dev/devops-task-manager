import {
    IsIP,
    IsOptional,
    IsString,
    IsUUID,
    IsDate,
} from 'class-validator';

export class CreateSessionDto {
    @IsUUID()
    userId: string;

    @IsString()
    tokenHash: string;

    @IsDate()
    expiresAt: Date;

    @IsOptional()
    @IsString()
    userAgent?: string | null;

    @IsOptional()
    @IsIP()
    ipAddress?: string | null;
}