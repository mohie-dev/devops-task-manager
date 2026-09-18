import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { EmailVerificationToken } from './entities/email-verification-token.entity';

@Injectable()
export class EmailVerificationTokensService {
    constructor(
        @InjectRepository(EmailVerificationToken)
        private readonly emailVerificationTokensRepository: Repository<EmailVerificationToken>,
    ) { }

    /**
     * Creates a new email verification token for the specified user.
     */
    public async createToken(
        userId: string,
        tokenHash: string,
        expiresAt: Date,
    ): Promise<EmailVerificationToken> {
        const token = this.emailVerificationTokensRepository.create({
            user: { id: userId },
            tokenHash,
            expiresAt,
        });

        return this.emailVerificationTokensRepository.save(token);
    }

    /**
     * Finds and locks a valid email verification token inside a transaction.
     *
     * The pessimistic write lock prevents concurrent requests
     * from consuming the same verification token.
     */
    public async findValidToken(
        tokenHash: string,
        manager: EntityManager,
    ): Promise<EmailVerificationToken | null> {
        return manager
            .getRepository(EmailVerificationToken)
            .createQueryBuilder('verificationToken')
            .where('verificationToken.tokenHash = :tokenHash', {
                tokenHash,
            })
            .andWhere('verificationToken.usedAt IS NULL')
            .andWhere('verificationToken.expiresAt > :now', {
                now: new Date(),
            })
            .setLock('pessimistic_write')
            .getOne();
    }

    /**
     * Marks an email verification token as used.
     */
    public async markAsUsed(
        tokenId: string,
        manager?: EntityManager,
    ): Promise<void> {
        const repository = manager
            ? manager.getRepository(EmailVerificationToken)
            : this.emailVerificationTokensRepository;

        await repository.update(tokenId, {
            usedAt: new Date(),
        });
    }

    /**
     * Deletes expired email verification tokens.
     */
    public async deleteExpiredTokens(): Promise<void> {
        await this.emailVerificationTokensRepository
            .createQueryBuilder()
            .delete()
            .from(EmailVerificationToken)
            .where('expiresAt <= :now', {
                now: new Date(),
            })
            .execute();
    }

    public async invalidateUserTokens(
        userId: string,
    ): Promise<void> {
        await this.emailVerificationTokensRepository
            .createQueryBuilder()
            .update(EmailVerificationToken)
            .set({
                usedAt: new Date(),
            })
            .where('user_id = :userId', { userId })
            .andWhere('usedAt IS NULL')
            .execute();
    }
}