import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropTwoColumnsFromDriverAssign1775641621539 implements MigrationInterface {
  name = 'DropTwoColumnsFromDriverAssign1775641621539';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "master_vehicle"."driver_assigns" DROP COLUMN "start_odometer"`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_vehicle"."driver_assigns" DROP COLUMN "end_odometer"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "master_vehicle"."driver_assigns" ADD "end_odometer" character varying(10)`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_vehicle"."driver_assigns" ADD "start_odometer" character varying(10)`,
    );
  }
}
