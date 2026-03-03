// src/database/migrations/xxxx-CreateMasterCompanySchema.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMasterCompanySchema1771234167748 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS master_company`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP SCHEMA IF EXISTS master_company CASCADE`);
  }
}
