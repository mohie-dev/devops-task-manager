import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

import { AuthProvider } from '../../../utils/enum';
import { Task } from 'src/tasks/entities/task.entity';
import { RefreshSession } from 'src/sessions/entities/refresh-session.entity';
import { Exclude } from 'class-transformer';
import { PasswordResetToken } from 'src/auth/entities/password-reset-token.entity';

@Entity({ name: 'users' })
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 100 })
    firstName: string;

    @Column({ type: 'varchar', length: 100 })
    lastName: string;

    @Column({ type: 'varchar', length: 255, unique: true })
    email: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    @Exclude({ toPlainOnly: true })
    passwordHash: string | null;

    @Column({ type: 'text', nullable: true })
    avatar: string | null;

    @Column({
        type: 'enum',
        enum: AuthProvider,
        default: AuthProvider.LOCAL,
    })
    provider: AuthProvider;

    @Column({ type: 'varchar', length: 255, nullable: true })
    providerId: string | null;

    @Column({ type: 'boolean', default: false })
    isEmailVerified: boolean;

    @Column({ type: 'boolean', default: true })
    isActive: boolean;

    @Column({ type: 'timestamp', nullable: true })
    lastLoginAt: Date | null;

    @OneToMany(() => Task, (task) => task.user)
    tasks: Task[];

    @OneToMany(
        () => RefreshSession,
        (refreshSession) => refreshSession.user,
    )
    refreshSessions: RefreshSession[];

    @OneToMany(
        () => PasswordResetToken,
        (passwordResetToken) => passwordResetToken.user,
    )
    passwordResetTokens: PasswordResetToken[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}