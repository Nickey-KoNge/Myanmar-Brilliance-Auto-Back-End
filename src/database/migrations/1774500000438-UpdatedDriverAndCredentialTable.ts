import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatedDriverAndCredentialTable1774500000438 implements MigrationInterface {
  name = 'UpdatedDriverAndCredentialTable1774500000438';

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
      `ALTER TABLE "master_vehicle"."vehicle_brands" ALTER COLUMN "id" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_vehicle"."vehicle_brands" ALTER COLUMN "id" SET DEFAULT uuid_generate_v7()`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."refresh_tokens" ALTER COLUMN "id" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."refresh_tokens" ALTER COLUMN "id" SET DEFAULT uuid_generate_v7()`,
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
      `ALTER TABLE "master_company"."groups" DROP CONSTRAINT "FK_aba669357adaeeb3fe975f27c15"`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."driver" DROP CONSTRAINT "FK_d23d55f1d6942ed6f4f70bb7eb4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."stations" ALTER COLUMN "id" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."stations" ALTER COLUMN "id" SET DEFAULT uuid_generate_v7()`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."driver" ALTER COLUMN "id" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."driver" ALTER COLUMN "id" SET DEFAULT uuid_generate_v7()`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."driver" ALTER COLUMN "credential_id" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."driver" ADD CONSTRAINT "UQ_43b402c6bc8617cfa469666bd7b" UNIQUE ("credential_id")`,
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
      `ALTER TABLE "master_company"."groups" ALTER COLUMN "id" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."groups" ALTER COLUMN "id" SET DEFAULT uuid_generate_v7()`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."refresh_tokens" ADD CONSTRAINT "FK_19eaf0aa60f0723c53ac9483ce1" FOREIGN KEY ("credential_id") REFERENCES "master_company"."credentials"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."branches" ADD CONSTRAINT "FK_5973f79e64a27c506b07cd84b29" FOREIGN KEY ("company_id") REFERENCES "master_company"."company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."stations" ADD CONSTRAINT "FK_694bd7bed2ab132658994347d36" FOREIGN KEY ("branches_id") REFERENCES "master_company"."branches"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."driver" ADD CONSTRAINT "FK_43b402c6bc8617cfa469666bd7b" FOREIGN KEY ("credential_id") REFERENCES "master_company"."credentials"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."driver" ADD CONSTRAINT "FK_d23d55f1d6942ed6f4f70bb7eb4" FOREIGN KEY ("station_id") REFERENCES "master_company"."stations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
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
      `ALTER TABLE "master_company"."driver" DROP CONSTRAINT "FK_d23d55f1d6942ed6f4f70bb7eb4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."driver" DROP CONSTRAINT "FK_43b402c6bc8617cfa469666bd7b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."stations" DROP CONSTRAINT "FK_694bd7bed2ab132658994347d36"`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."branches" DROP CONSTRAINT "FK_5973f79e64a27c506b07cd84b29"`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."refresh_tokens" DROP CONSTRAINT "FK_19eaf0aa60f0723c53ac9483ce1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."groups" ALTER COLUMN "id" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."groups" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`,
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
      `ALTER TABLE "master_company"."driver" DROP CONSTRAINT "UQ_43b402c6bc8617cfa469666bd7b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."driver" ALTER COLUMN "credential_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."driver" ALTER COLUMN "id" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."driver" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."stations" ALTER COLUMN "id" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."stations" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."driver" ADD CONSTRAINT "FK_d23d55f1d6942ed6f4f70bb7eb4" FOREIGN KEY ("station_id") REFERENCES "master_company"."stations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."groups" ADD CONSTRAINT "FK_aba669357adaeeb3fe975f27c15" FOREIGN KEY ("station_id") REFERENCES "master_company"."stations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
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
      `ALTER TABLE "master_company"."refresh_tokens" ALTER COLUMN "id" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."refresh_tokens" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_vehicle"."vehicle_brands" ALTER COLUMN "id" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_vehicle"."vehicle_brands" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`,
    );
  }
}
