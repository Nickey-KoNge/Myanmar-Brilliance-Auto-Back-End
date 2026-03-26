import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateGroupTable1774491025078 implements MigrationInterface {
  name = 'UpdateGroupTable1774491025078';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Ensure the UUID extension and the custom v7 generator function exist
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
        CREATE OR REPLACE FUNCTION uuid_generate_v7() RETURNS uuid AS $$
        DECLARE
            v_time timestamp with time zone:= clock_timestamp();
            v_giga_ts bigint := floor(extract(epoch from v_time) * 1000);
        BEGIN
            RETURN encode(
                set_bit(
                    set_bit(
                        overlay(uuid_send(gen_random_uuid()) placing substring(decode(lpad(to_hex(v_giga_ts), 12, '0'), 'hex') from 1 for 6) from 1 for 6),
                        52, 1
                    ), 53, 1
                ), 
                'hex')::uuid;
        END;
        $$ LANGUAGE plpgsql VOLATILE;
    `);

    await queryRunner.query(
      `CREATE TABLE "master_company"."groups" ("id" uuid NOT NULL DEFAULT uuid_generate_v7(), "group_name" character varying(100) NOT NULL, "group_type" character varying(20) NOT NULL, "station_id" uuid NOT NULL, "description" character varying(255), "status" character varying(20) NOT NULL DEFAULT 'Active', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_ef10d4611e4f355d10ecaa10ac6" UNIQUE ("group_name"), CONSTRAINT "UQ_a472e029c6b02083159ca7ce6ca" UNIQUE ("group_type"), CONSTRAINT "PK_659d1483316afb28afd3a90646e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ef10d4611e4f355d10ecaa10ac" ON "master_company"."groups" ("group_name") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a472e029c6b02083159ca7ce6c" ON "master_company"."groups" ("group_type") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_aba669357adaeeb3fe975f27c1" ON "master_company"."groups" ("station_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7ca82b56bd3a8a7ed87267c008" ON "master_company"."groups" ("description") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_479d3d96102ea6e80113503c68" ON "master_company"."groups" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_35edcbb2e911070037b570c42a" ON "master_company"."groups" ("group_name", "status") `,
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
    await queryRunner.query(
      `ALTER TABLE "master_company"."groups" ADD CONSTRAINT "FK_aba669357adaeeb3fe975f27c15" FOREIGN KEY ("station_id") REFERENCES "master_company"."stations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "master_company"."groups" DROP CONSTRAINT "FK_aba669357adaeeb3fe975f27c15"`,
    );
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
      `DROP INDEX "master_company"."IDX_35edcbb2e911070037b570c42a"`,
    );
    await queryRunner.query(
      `DROP INDEX "master_company"."IDX_479d3d96102ea6e80113503c68"`,
    );
    await queryRunner.query(
      `DROP INDEX "master_company"."IDX_7ca82b56bd3a8a7ed87267c008"`,
    );
    await queryRunner.query(
      `DROP INDEX "master_company"."IDX_aba669357adaeeb3fe975f27c1"`,
    );
    await queryRunner.query(
      `DROP INDEX "master_company"."IDX_a472e029c6b02083159ca7ce6c"`,
    );
    await queryRunner.query(
      `DROP INDEX "master_company"."IDX_ef10d4611e4f355d10ecaa10ac"`,
    );
    await queryRunner.query(`DROP TABLE "master_company"."groups"`);
  }
}
