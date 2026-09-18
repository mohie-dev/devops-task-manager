import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { PasswordResetToken } from './entities/password-reset-token.entity';

@Injectable()
export class PasswordResetTokensService {
    constructor(
        @InjectRepository(PasswordResetToken)
        private readonly passwordResetTokensRepository: Repository<PasswordResetToken>,
    ) { }

    /**
     * Creates a new password reset token for the specified user.
     */
    public async createToken(
        userId: string,
        tokenHash: string,
        expiresAt: Date,
    ): Promise<PasswordResetToken> {
        const token = this.passwordResetTokensRepository.create({
            user: { id: userId },
            tokenHash,
            expiresAt,
        });

        return this.passwordResetTokensRepository.save(token);
    }

    /**
     * Finds and locks a valid password reset token inside a transaction.
     *
     * The token row is locked using a pessimistic write lock
     * to prevent concurrent requests from consuming the same token.
     */
    public async findValidToken(
        tokenHash: string,
        manager: EntityManager,
    ): Promise<PasswordResetToken | null> {
        return manager
            .getRepository(PasswordResetToken)
            .createQueryBuilder('resetToken')
            .where('resetToken.tokenHash = :tokenHash', {
                tokenHash,
            })
            .andWhere('resetToken.usedAt IS NULL')
            .andWhere('resetToken.expiresAt > :now', {
                now: new Date(),
            })
            .setLock('pessimistic_write')
            .getOne();
    }

    /**
     * Marks a password reset token as used.
     */
    public async markAsUsed(
        tokenId: string,
        manager?: EntityManager,
    ): Promise<void> {
        const repository = manager
            ? manager.getRepository(PasswordResetToken)
            : this.passwordResetTokensRepository;

        await repository.update(tokenId, {
            usedAt: new Date(),
        });
    }

    /**
     * Deletes expired password reset tokens.
     */
    public async deleteExpiredTokens(): Promise<void> {
        await this.passwordResetTokensRepository
            .createQueryBuilder()
            .delete()
            .from(PasswordResetToken)
            .where('expiresAt <= :now', {
                now: new Date(),
            })
            .execute();
    }
}