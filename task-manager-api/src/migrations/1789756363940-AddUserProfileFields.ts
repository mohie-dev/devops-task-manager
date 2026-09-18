import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserProfileFields1789756363940 implements MigrationInterface {
    name = 'AddUserProfileFields1789756363940'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "bio" text`);
        await queryRunner.query(`ALTER TABLE "users" ADD "phoneNumber" character varying(50)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "jobTitle" character varying(100)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "jobTitle"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "phoneNumber"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "bio"`);
    }

}
