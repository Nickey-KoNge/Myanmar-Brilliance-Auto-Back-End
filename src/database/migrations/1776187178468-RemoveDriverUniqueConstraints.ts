import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveDriverUniqueConstraints1776187178468 implements MigrationInterface {
  name = 'RemoveDriverUniqueConstraints1776187178468';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 🛑 driver_name ၏ Unique Constraint အား ဖြုတ်ခြင်း
    await queryRunner.query(
      `ALTER TABLE "master_company"."driver" DROP CONSTRAINT "UQ_4d032a6a55b32e7f26029cc6d49"`,
    );
    // 🛑 license_type ၏ Unique Constraint အား ဖြုတ်ခြင်း
    await queryRunner.query(
      `ALTER TABLE "master_company"."driver" DROP CONSTRAINT "UQ_bb2ae6ba395f38d7b112c0de9ce"`,
    );
    // 🛑 driving_exp ၏ Unique Constraint အား ဖြုတ်ခြင်း
    await queryRunner.query(
      `ALTER TABLE "master_company"."driver" DROP CONSTRAINT "UQ_d0d7947869d5ab46f81f4ea278f"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 🛑 Rollback လုပ်ပါက Unique များ ပြန်ထည့်ပေးရန်
    await queryRunner.query(
      `ALTER TABLE "master_company"."driver" ADD CONSTRAINT "UQ_d0d7947869d5ab46f81f4ea278f" UNIQUE ("driving_exp")`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."driver" ADD CONSTRAINT "UQ_bb2ae6ba395f38d7b112c0de9ce" UNIQUE ("license_type")`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."driver" ADD CONSTRAINT "UQ_4d032a6a55b32e7f26029cc6d49" UNIQUE ("driver_name")`,
    );
  }
}
