import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateVehicleBrandTable1774499290927 implements MigrationInterface {
  name = 'UpdateVehicleBrandTable1774499290927';

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
      `CREATE TABLE "master_vehicle"."vehicle_brands" ("id" uuid NOT NULL DEFAULT uuid_generate_v7(), "vehicle_brand_name" character varying(100) NOT NULL, "country_of_origin" character varying(50) NOT NULL, "manufacturer" character varying(100) NOT NULL, "image" character varying(255) NOT NULL, "description" character varying(255) NOT NULL, "status" character varying(20) NOT NULL DEFAULT 'Active', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_3b8417bf9eab8d1a75ac4ee000c" UNIQUE ("vehicle_brand_name"), CONSTRAINT "PK_3ede5be03b371734e1d8aa257c9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3b8417bf9eab8d1a75ac4ee000" ON "master_vehicle"."vehicle_brands" ("vehicle_brand_name") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_33a83a5f7c025a35f1922d77d4" ON "master_vehicle"."vehicle_brands" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_070747687d7cdbbb46ae886451" ON "master_vehicle"."vehicle_brands" ("country_of_origin", "status") `,
    );
    await queryRunner.query(
      `CREATE TABLE "master_company"."driver" ("id" uuid NOT NULL DEFAULT uuid_generate_v7(), "driver_name" character varying(100) NOT NULL, "credential_id" uuid NOT NULL, "station_id" uuid NOT NULL, "nrc" character varying(50) NOT NULL, "phone" character varying(20) NOT NULL, "address" character varying(100) NOT NULL, "city" character varying(50) NOT NULL, "country" character varying(50) NOT NULL, "dob" date, "gender" character varying(20) NOT NULL DEFAULT 'Male', "deposits" character varying(255), "join_date" date, "license_no" character varying(50) NOT NULL, "license_type" character varying(10) NOT NULL, "license_expiry" date, "driving_exp" character varying(20) NOT NULL, "image" character varying(255), "status" character varying(20) NOT NULL DEFAULT 'Active', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_4d032a6a55b32e7f26029cc6d49" UNIQUE ("driver_name"), CONSTRAINT "UQ_fefc3c501fd2ee295d768f68a2a" UNIQUE ("nrc"), CONSTRAINT "UQ_a543b386d47b7e80c3047522a48" UNIQUE ("phone"), CONSTRAINT "UQ_49dfa55dd074761b2967080ee9c" UNIQUE ("license_no"), CONSTRAINT "UQ_bb2ae6ba395f38d7b112c0de9ce" UNIQUE ("license_type"), CONSTRAINT "UQ_d0d7947869d5ab46f81f4ea278f" UNIQUE ("driving_exp"), CONSTRAINT "PK_61de71a8d217d585ecd5ee3d065" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4d032a6a55b32e7f26029cc6d4" ON "master_company"."driver" ("driver_name") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_43b402c6bc8617cfa469666bd7" ON "master_company"."driver" ("credential_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d23d55f1d6942ed6f4f70bb7eb" ON "master_company"."driver" ("station_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fefc3c501fd2ee295d768f68a2" ON "master_company"."driver" ("nrc") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a543b386d47b7e80c3047522a4" ON "master_company"."driver" ("phone") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d8cf2327b6f19b727e5039bcc6" ON "master_company"."driver" ("address") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4ffa406cf6d2a2e10f4123bb87" ON "master_company"."driver" ("city") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ff8e4fa646b8c64719faf2582e" ON "master_company"."driver" ("country") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2917e2b3232565fa661429ce80" ON "master_company"."driver" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_848851a1a16ee9d2bd0ff6a126" ON "master_company"."driver" ("driver_name", "status") `,
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
      `ALTER TABLE "master_company"."groups" DROP CONSTRAINT "FK_aba669357adaeeb3fe975f27c15"`,
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
      `ALTER TABLE "master_company"."groups" ALTER COLUMN "id" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."groups" ALTER COLUMN "id" SET DEFAULT uuid_generate_v7()`,
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
    await queryRunner.query(
      `ALTER TABLE "master_company"."driver" ADD CONSTRAINT "FK_d23d55f1d6942ed6f4f70bb7eb4" FOREIGN KEY ("station_id") REFERENCES "master_company"."stations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "master_company"."driver" DROP CONSTRAINT "FK_d23d55f1d6942ed6f4f70bb7eb4"`,
    );
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
      `ALTER TABLE "master_company"."groups" ADD CONSTRAINT "FK_aba669357adaeeb3fe975f27c15" FOREIGN KEY ("station_id") REFERENCES "master_company"."stations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
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
      `DROP INDEX "master_company"."IDX_848851a1a16ee9d2bd0ff6a126"`,
    );
    await queryRunner.query(
      `DROP INDEX "master_company"."IDX_2917e2b3232565fa661429ce80"`,
    );
    await queryRunner.query(
      `DROP INDEX "master_company"."IDX_ff8e4fa646b8c64719faf2582e"`,
    );
    await queryRunner.query(
      `DROP INDEX "master_company"."IDX_4ffa406cf6d2a2e10f4123bb87"`,
    );
    await queryRunner.query(
      `DROP INDEX "master_company"."IDX_d8cf2327b6f19b727e5039bcc6"`,
    );
    await queryRunner.query(
      `DROP INDEX "master_company"."IDX_a543b386d47b7e80c3047522a4"`,
    );
    await queryRunner.query(
      `DROP INDEX "master_company"."IDX_fefc3c501fd2ee295d768f68a2"`,
    );
    await queryRunner.query(
      `DROP INDEX "master_company"."IDX_d23d55f1d6942ed6f4f70bb7eb"`,
    );
    await queryRunner.query(
      `DROP INDEX "master_company"."IDX_43b402c6bc8617cfa469666bd7"`,
    );
    await queryRunner.query(
      `DROP INDEX "master_company"."IDX_4d032a6a55b32e7f26029cc6d4"`,
    );
    await queryRunner.query(`DROP TABLE "master_company"."driver"`);
    await queryRunner.query(
      `DROP INDEX "master_vehicle"."IDX_070747687d7cdbbb46ae886451"`,
    );
    await queryRunner.query(
      `DROP INDEX "master_vehicle"."IDX_33a83a5f7c025a35f1922d77d4"`,
    );
    await queryRunner.query(
      `DROP INDEX "master_vehicle"."IDX_3b8417bf9eab8d1a75ac4ee000"`,
    );
    await queryRunner.query(`DROP TABLE "master_vehicle"."vehicle_brands"`);
  }
}
