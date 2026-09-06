import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshSession } from './entities/refresh-session.entity';
import { CreateSessionDto } from './dtos/create-session.dto';

@Injectable()
export class SessionsService {
    constructor(
        @InjectRepository(RefreshSession)
        private readonly sessionsRepository: Repository<RefreshSession>,
    ) { }

    /**
     * Create a new refresh session
     * @param createSessionDto
     * @returns RefreshSession
    */
    public async createSession(
        createSessionDto: CreateSessionDto,
    ): Promise<RefreshSession> {
        const session = this.sessionsRepository.create({
            user: { id: createSessionDto.userId },
            tokenHash: createSessionDto.tokenHash,
            expiresAt: createSessionDto.expiresAt,
            userAgent: createSessionDto.userAgent ?? null,
            ipAddress: createSessionDto.ipAddress ?? null,
        });

        return this.sessionsRepository.save(session);
    }

    /**
     * Find a session by its token hash
     * @param tokenHash
     * @returns RefreshSession or null
     */
    public async findByTokenHash(
        tokenHash: string,
    ): Promise<RefreshSession | null> {
        return this.sessionsRepository.findOne({
            where: { tokenHash },
            relations: {
                user: true,
            },
        });
    }

    /**
     * Revoke a session by its ID
     * @param sessionId
     * @returns void
     */
    public async revokeSession(sessionId: string): Promise<void> {
        await this.sessionsRepository.update(sessionId, {
            revokedAt: new Date(),
        });
    }

    /**
     * Revoke all sessions for a specific user
     * @param userId
     */
    public async revokeAllUserSessions(userId: string): Promise<void> {
        await this.sessionsRepository
            .createQueryBuilder()
            .update()
            .set({
                revokedAt: new Date(),
            })
            .where('user_id = :userId', { userId })
            .andWhere('revokedAt IS NULL')
            .execute();
    }

    /**
     * Cleanup expired or revoked sessions
     */
    public async cleanupSessions(): Promise<void> {
        await this.sessionsRepository
            .createQueryBuilder()
            .delete()
            .from(RefreshSession)
            .where('expiresAt <= :now OR revokedAt IS NOT NULL', { now: new Date() })
            .execute();
    }
}