import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPhoneToStation1774451133386 implements MigrationInterface {
  name = 'AddPhoneToStation1774451133386';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "master_company"."stations" ADD "phone" character varying(20)`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."refresh_tokens" ALTER COLUMN "id" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."refresh_tokens" ALTER COLUMN "id" SET DEFAULT uuid_generate_v7()`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."refresh_tokens" DROP CONSTRAINT "FK_19eaf0aa60f0723c53ac9483ce1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."staff" DROP CONSTRAINT "FK_7915a0ef1701c5ee56f716f5590"`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."credentials" ALTER COLUMN "id" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."credentials" ALTER COLUMN "id" SET DEFAULT uuid_generate_v7()`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."stations" ALTER COLUMN "id" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."stations" ALTER COLUMN "id" SET DEFAULT uuid_generate_v7()`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."staff" DROP CONSTRAINT "FK_08ca698771f9a1b8ed8f98e6d16"`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."stations" DROP CONSTRAINT "FK_694bd7bed2ab132658994347d36"`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."branches" ALTER COLUMN "id" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."branches" ALTER COLUMN "id" SET DEFAULT uuid_generate_v7()`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."branches" DROP CONSTRAINT "FK_5973f79e64a27c506b07cd84b29"`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."staff" DROP CONSTRAINT "FK_4e4bf5357315e806b391188d3e1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."company" ALTER COLUMN "id" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."company" ALTER COLUMN "id" SET DEFAULT uuid_generate_v7()`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."staff" ALTER COLUMN "id" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."staff" ALTER COLUMN "id" SET DEFAULT uuid_generate_v7()`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."staff" DROP CONSTRAINT "FK_c3fe01125c99573751fe5e55666"`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_service"."roles" ALTER COLUMN "id" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_service"."roles" ALTER COLUMN "id" SET DEFAULT uuid_generate_v7()`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_93add8419b7be996abf670a6f9" ON "master_company"."stations" ("phone") `,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."refresh_tokens" ADD CONSTRAINT "FK_19eaf0aa60f0723c53ac9483ce1" FOREIGN KEY ("credential_id") REFERENCES "master_company"."credentials"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."stations" ADD CONSTRAINT "FK_694bd7bed2ab132658994347d36" FOREIGN KEY ("branches_id") REFERENCES "master_company"."branches"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."branches" ADD CONSTRAINT "FK_5973f79e64a27c506b07cd84b29" FOREIGN KEY ("company_id") REFERENCES "master_company"."company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."staff" ADD CONSTRAINT "FK_7915a0ef1701c5ee56f716f5590" FOREIGN KEY ("credential_id") REFERENCES "master_company"."credentials"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."staff" ADD CONSTRAINT "FK_4e4bf5357315e806b391188d3e1" FOREIGN KEY ("company_id") REFERENCES "master_company"."company"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."staff" ADD CONSTRAINT "FK_08ca698771f9a1b8ed8f98e6d16" FOREIGN KEY ("branches_id") REFERENCES "master_company"."branches"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."staff" ADD CONSTRAINT "FK_c3fe01125c99573751fe5e55666" FOREIGN KEY ("role_id") REFERENCES "master_service"."roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "master_company"."staff" DROP CONSTRAINT "FK_c3fe01125c99573751fe5e55666"`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."staff" DROP CONSTRAINT "FK_08ca698771f9a1b8ed8f98e6d16"`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."staff" DROP CONSTRAINT "FK_4e4bf5357315e806b391188d3e1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."staff" DROP CONSTRAINT "FK_7915a0ef1701c5ee56f716f5590"`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."branches" DROP CONSTRAINT "FK_5973f79e64a27c506b07cd84b29"`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."stations" DROP CONSTRAINT "FK_694bd7bed2ab132658994347d36"`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."refresh_tokens" DROP CONSTRAINT "FK_19eaf0aa60f0723c53ac9483ce1"`,
    );
    await queryRunner.query(
      `DROP INDEX "master_company"."IDX_93add8419b7be996abf670a6f9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_service"."roles" ALTER COLUMN "id" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_service"."roles" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."staff" ADD CONSTRAINT "FK_c3fe01125c99573751fe5e55666" FOREIGN KEY ("role_id") REFERENCES "master_service"."roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."staff" ALTER COLUMN "id" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."staff" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."company" ALTER COLUMN "id" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."company" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."staff" ADD CONSTRAINT "FK_4e4bf5357315e806b391188d3e1" FOREIGN KEY ("company_id") REFERENCES "master_company"."company"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."branches" ADD CONSTRAINT "FK_5973f79e64a27c506b07cd84b29" FOREIGN KEY ("company_id") REFERENCES "master_company"."company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."branches" ALTER COLUMN "id" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."branches" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."stations" ADD CONSTRAINT "FK_694bd7bed2ab132658994347d36" FOREIGN KEY ("branches_id") REFERENCES "master_company"."branches"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."staff" ADD CONSTRAINT "FK_08ca698771f9a1b8ed8f98e6d16" FOREIGN KEY ("branches_id") REFERENCES "master_company"."branches"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."stations" ALTER COLUMN "id" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."stations" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."credentials" ALTER COLUMN "id" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."credentials" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."staff" ADD CONSTRAINT "FK_7915a0ef1701c5ee56f716f5590" FOREIGN KEY ("credential_id") REFERENCES "master_company"."credentials"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."refresh_tokens" ADD CONSTRAINT "FK_19eaf0aa60f0723c53ac9483ce1" FOREIGN KEY ("credential_id") REFERENCES "master_company"."credentials"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."refresh_tokens" ALTER COLUMN "id" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."refresh_tokens" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."stations" DROP COLUMN "phone"`,
    );
  }
}
