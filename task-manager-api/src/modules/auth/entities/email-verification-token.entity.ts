import { User } from "../../users/entities/user.entity";
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    RelationId
} from "typeorm";

@Entity({ name: 'email_verification_tokens' })
export class EmailVerificationToken {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @RelationId(
        (verificationToken: EmailVerificationToken) =>
            verificationToken.user,
    )
    userId: string;

    @Column({ type: 'varchar', length: 64, unique: true })
    tokenHash: string;

    @Column({ type: 'timestamp' })
    expiresAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    usedAt: Date | null;

    @CreateDateColumn()
    createdAt: Date;
}