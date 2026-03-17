import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateStaffTable1771251000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "master_company"."staff" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v7(),
        "staff_name" varchar(100) NOT NULL,
        "phone" varchar(20),
        "position" varchar(100),
        "status" varchar(20) DEFAULT 'Active',
        "credential_id" uuid,
        "company_id" uuid,
        "created_at" TIMESTAMP DEFAULT now(),
        "updated_at" TIMESTAMP DEFAULT now(),
        CONSTRAINT "PK_staff" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_staff_credential" UNIQUE ("credential_id"),
        CONSTRAINT "FK_staff_credential" FOREIGN KEY ("credential_id") 
            REFERENCES "master_company"."credentials"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_staff_company" FOREIGN KEY ("company_id") 
            REFERENCES "master_company"."company"("id") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "master_company"."staff"`);
  }
}
