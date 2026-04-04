import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMasterAuditSchema1775191104367 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS master_audit`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP SCHEMA IF EXISTS master_audit CASCADE`);
  }
}
