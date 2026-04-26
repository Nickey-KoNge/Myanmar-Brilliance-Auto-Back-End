import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangerentalopTable1776506308494 implements MigrationInterface {
  name = 'ChangerentalopTable1776506308494';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "master_rental"."rental_operations" ALTER COLUMN "extra_hours" TYPE character varying(20)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "master_rental"."rental_operations" ALTER COLUMN "extra_hours" TYPE character varying(2)`,
    );
  }
}
