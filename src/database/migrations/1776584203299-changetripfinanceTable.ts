import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangetripfinanceTable1776584203299 implements MigrationInterface {
  name = 'ChangetripfinanceTable1776584203299';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "master_rental"."trip_finances" DROP CONSTRAINT "FK_544541e657ff45a1698bb6bd857"`,
    );

    await queryRunner.query(
      `ALTER TABLE "master_rental"."trip_finances" ADD CONSTRAINT "FK_544541e657ff45a1698bb6bd857" FOREIGN KEY ("staff_id") REFERENCES "master_company"."staff"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "master_rental"."trip_finances" DROP CONSTRAINT "FK_544541e657ff45a1698bb6bd857"`,
    );

    await queryRunner.query(
      `ALTER TABLE "master_rental"."trip_finances" ADD CONSTRAINT "FK_544541e657ff45a1698bb6bd857" FOREIGN KEY ("staff_id") REFERENCES "master_company"."staff"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
