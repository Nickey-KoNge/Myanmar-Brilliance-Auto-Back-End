import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCredentialsTable1771250000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "master_company"."credentials" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v7(),
        "email" varchar(100) NOT NULL,
        "password" varchar(255) NOT NULL,
        "status" varchar(20) DEFAULT 'Active',
        "created_at" TIMESTAMP DEFAULT now(),
        "updated_at" TIMESTAMP DEFAULT now(),
        CONSTRAINT "PK_credentials" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_credentials_email" UNIQUE ("email")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "master_company"."credentials"`);
  }
}
