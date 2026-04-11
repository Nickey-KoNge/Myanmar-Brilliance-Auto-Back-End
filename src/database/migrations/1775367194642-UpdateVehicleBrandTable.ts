import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateVehicleBrandTable1775367194642 implements MigrationInterface {
  name = 'UpdateVehicleBrandTable1775367194642';

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
      `CREATE TABLE "master_vehicle"."vehicles" ("id" uuid NOT NULL DEFAULT uuid_generate_v7(), "vehicle_name" character varying(100) NOT NULL, "station_id" uuid, "group_id" uuid, "vehicle_model_id" uuid NOT NULL, "supplier_id" uuid, "city_taxi_no" character varying(20), "serial_no" character varying(50), "vin_no" character varying(50), "engine_no" character varying(50), "license_plate" character varying(50) NOT NULL, "color" character varying(20), "license_type" character varying(20), "current_odometer" character varying(10), "vehicle_license_exp" date, "service_intervals" date, "purchase_date" date, "image" character varying(255), "status" character varying(20) NOT NULL DEFAULT 'Active', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_18d8646b59304dce4af3a9e35b6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8b2b9b3559e5f09d2225eb28a7" ON "master_vehicle"."vehicles" ("vehicle_name") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_29b86ed80ea430da8243f2fd78" ON "master_vehicle"."vehicles" ("station_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9b5ca17f4e93f005c006d97b97" ON "master_vehicle"."vehicles" ("group_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0cf2b97124eb0eb2b0c97f3814" ON "master_vehicle"."vehicles" ("vehicle_model_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_59046774697595e4ddeec7e546" ON "master_vehicle"."vehicles" ("supplier_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d2f8db069bc1f769e63cd191fc" ON "master_vehicle"."vehicles" ("serial_no") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9e7084411758d37d9115995e41" ON "master_vehicle"."vehicles" ("vin_no") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4b1b6a45164d820d7812a99211" ON "master_vehicle"."vehicles" ("engine_no") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7e9fab2e8625b63613f67bd706" ON "master_vehicle"."vehicles" ("license_plate") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_198957f5c5a1fa53aeaf2a0838" ON "master_vehicle"."vehicles" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5684a952ad483725670217c180" ON "master_vehicle"."vehicles" ("vehicle_name", "license_plate", "status") `,
    );
    await queryRunner.query(
      `CREATE TABLE "master_vehicle"."vehicle_models" ("id" uuid NOT NULL DEFAULT uuid_generate_v7(), "vehicle_model_name" character varying(100) NOT NULL, "vehicle_brand_id" uuid NOT NULL, "body_type" character varying(50) NOT NULL, "fuel_type" character varying(50) NOT NULL, "transmission" character varying(50) NOT NULL, "engine_capacity" character varying(20) NOT NULL, "year_of_release" date NOT NULL, "status" character varying(20) NOT NULL DEFAULT 'Active', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_02a370dd98c5c46cc1ccd632605" UNIQUE ("vehicle_model_name"), CONSTRAINT "PK_1c01752184334fdbcae9bbaa67f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_02a370dd98c5c46cc1ccd63260" ON "master_vehicle"."vehicle_models" ("vehicle_model_name") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b8f74f8091616bbedf5be859e1" ON "master_vehicle"."vehicle_models" ("vehicle_brand_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_275e597ac257373f8d87649fb5" ON "master_vehicle"."vehicle_models" ("body_type") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6d392adf68b73b6a4532c4a2b9" ON "master_vehicle"."vehicle_models" ("engine_capacity") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a8523784b7bbeed715809a22f7" ON "master_vehicle"."vehicle_models" ("year_of_release") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ca3482fc1cd9994167054647cb" ON "master_vehicle"."vehicle_models" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_08df705b2473a4f77cdfe5e750" ON "master_vehicle"."vehicle_models" ("vehicle_model_name", "fuel_type", "status") `,
    );
    await queryRunner.query(
      `DROP INDEX "master_vehicle"."IDX_070747687d7cdbbb46ae886451"`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_vehicle"."vehicle_brands" ALTER COLUMN "id" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_vehicle"."vehicle_brands" ALTER COLUMN "id" SET DEFAULT uuid_generate_v7()`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_vehicle"."vehicle_brands" DROP COLUMN "country_of_origin"`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_vehicle"."vehicle_brands" ADD "country_of_origin" character varying(100)`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_vehicle"."vehicle_brands" DROP COLUMN "manufacturer"`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_vehicle"."vehicle_brands" ADD "manufacturer" character varying(50)`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_vehicle"."vehicle_brands" ALTER COLUMN "image" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_vehicle"."vehicle_brands" ALTER COLUMN "description" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_vehicle"."vehicle_brands" ALTER COLUMN "status" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_vehicle"."vehicle_brands" ALTER COLUMN "created_at" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_vehicle"."vehicle_brands" ALTER COLUMN "updated_at" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."refresh_tokens" ALTER COLUMN "id" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."refresh_tokens" ALTER COLUMN "id" SET DEFAULT uuid_generate_v7()`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."driver" ALTER COLUMN "id" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."driver" ALTER COLUMN "id" SET DEFAULT uuid_generate_v7()`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."refresh_tokens" DROP CONSTRAINT "FK_19eaf0aa60f0723c53ac9483ce1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."staff" DROP CONSTRAINT "FK_7915a0ef1701c5ee56f716f5590"`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."driver" DROP CONSTRAINT "FK_43b402c6bc8617cfa469666bd7b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."credentials" ALTER COLUMN "id" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."credentials" ALTER COLUMN "id" SET DEFAULT uuid_generate_v7()`,
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
      `ALTER TABLE "master_company"."staff" ALTER COLUMN "id" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."staff" ALTER COLUMN "id" SET DEFAULT uuid_generate_v7()`,
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
      `ALTER TABLE "master_company"."groups" ALTER COLUMN "id" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."groups" ALTER COLUMN "id" SET DEFAULT uuid_generate_v7()`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_audit"."audit" ALTER COLUMN "id" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_audit"."audit" ALTER COLUMN "id" SET DEFAULT uuid_generate_v7()`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6214369e9642bc805f69d4ff32" ON "master_vehicle"."vehicle_brands" ("country_of_origin") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_070747687d7cdbbb46ae886451" ON "master_vehicle"."vehicle_brands" ("country_of_origin", "status") `,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."refresh_tokens" ADD CONSTRAINT "FK_19eaf0aa60f0723c53ac9483ce1" FOREIGN KEY ("credential_id") REFERENCES "master_company"."credentials"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
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
      `ALTER TABLE "master_company"."branches" ADD CONSTRAINT "FK_5973f79e64a27c506b07cd84b29" FOREIGN KEY ("company_id") REFERENCES "master_company"."company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."stations" ADD CONSTRAINT "FK_694bd7bed2ab132658994347d36" FOREIGN KEY ("branches_id") REFERENCES "master_company"."branches"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."groups" ADD CONSTRAINT "FK_aba669357adaeeb3fe975f27c15" FOREIGN KEY ("station_id") REFERENCES "master_company"."stations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_vehicle"."vehicles" ADD CONSTRAINT "FK_29b86ed80ea430da8243f2fd78c" FOREIGN KEY ("station_id") REFERENCES "master_company"."stations"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_vehicle"."vehicles" ADD CONSTRAINT "FK_9b5ca17f4e93f005c006d97b978" FOREIGN KEY ("group_id") REFERENCES "master_company"."groups"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_vehicle"."vehicles" ADD CONSTRAINT "FK_0cf2b97124eb0eb2b0c97f3814d" FOREIGN KEY ("vehicle_model_id") REFERENCES "master_vehicle"."vehicle_models"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_vehicle"."vehicle_models" ADD CONSTRAINT "FK_b8f74f8091616bbedf5be859e1a" FOREIGN KEY ("vehicle_brand_id") REFERENCES "master_vehicle"."vehicle_brands"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "master_vehicle"."vehicle_models" DROP CONSTRAINT "FK_b8f74f8091616bbedf5be859e1a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_vehicle"."vehicles" DROP CONSTRAINT "FK_0cf2b97124eb0eb2b0c97f3814d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_vehicle"."vehicles" DROP CONSTRAINT "FK_9b5ca17f4e93f005c006d97b978"`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_vehicle"."vehicles" DROP CONSTRAINT "FK_29b86ed80ea430da8243f2fd78c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."groups" DROP CONSTRAINT "FK_aba669357adaeeb3fe975f27c15"`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."stations" DROP CONSTRAINT "FK_694bd7bed2ab132658994347d36"`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."branches" DROP CONSTRAINT "FK_5973f79e64a27c506b07cd84b29"`,
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
      `ALTER TABLE "master_company"."refresh_tokens" DROP CONSTRAINT "FK_19eaf0aa60f0723c53ac9483ce1"`,
    );
    await queryRunner.query(
      `DROP INDEX "master_vehicle"."IDX_070747687d7cdbbb46ae886451"`,
    );
    await queryRunner.query(
      `DROP INDEX "master_vehicle"."IDX_6214369e9642bc805f69d4ff32"`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_audit"."audit" ALTER COLUMN "id" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_audit"."audit" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."groups" ALTER COLUMN "id" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."groups" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`,
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
      `ALTER TABLE "master_company"."staff" ALTER COLUMN "id" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."staff" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`,
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
      `ALTER TABLE "master_company"."credentials" ALTER COLUMN "id" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."credentials" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."driver" ADD CONSTRAINT "FK_43b402c6bc8617cfa469666bd7b" FOREIGN KEY ("credential_id") REFERENCES "master_company"."credentials"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."staff" ADD CONSTRAINT "FK_7915a0ef1701c5ee56f716f5590" FOREIGN KEY ("credential_id") REFERENCES "master_company"."credentials"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."refresh_tokens" ADD CONSTRAINT "FK_19eaf0aa60f0723c53ac9483ce1" FOREIGN KEY ("credential_id") REFERENCES "master_company"."credentials"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."driver" ALTER COLUMN "id" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."driver" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."refresh_tokens" ALTER COLUMN "id" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."refresh_tokens" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_vehicle"."vehicle_brands" ALTER COLUMN "updated_at" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_vehicle"."vehicle_brands" ALTER COLUMN "created_at" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_vehicle"."vehicle_brands" ALTER COLUMN "status" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_vehicle"."vehicle_brands" ALTER COLUMN "description" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_vehicle"."vehicle_brands" ALTER COLUMN "image" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_vehicle"."vehicle_brands" DROP COLUMN "manufacturer"`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_vehicle"."vehicle_brands" ADD "manufacturer" character varying(100) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_vehicle"."vehicle_brands" DROP COLUMN "country_of_origin"`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_vehicle"."vehicle_brands" ADD "country_of_origin" character varying(50) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_vehicle"."vehicle_brands" ALTER COLUMN "id" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_vehicle"."vehicle_brands" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_070747687d7cdbbb46ae886451" ON "master_vehicle"."vehicle_brands" ("country_of_origin", "status") `,
    );
    await queryRunner.query(
      `DROP INDEX "master_vehicle"."IDX_08df705b2473a4f77cdfe5e750"`,
    );
    await queryRunner.query(
      `DROP INDEX "master_vehicle"."IDX_ca3482fc1cd9994167054647cb"`,
    );
    await queryRunner.query(
      `DROP INDEX "master_vehicle"."IDX_a8523784b7bbeed715809a22f7"`,
    );
    await queryRunner.query(
      `DROP INDEX "master_vehicle"."IDX_6d392adf68b73b6a4532c4a2b9"`,
    );
    await queryRunner.query(
      `DROP INDEX "master_vehicle"."IDX_275e597ac257373f8d87649fb5"`,
    );
    await queryRunner.query(
      `DROP INDEX "master_vehicle"."IDX_b8f74f8091616bbedf5be859e1"`,
    );
    await queryRunner.query(
      `DROP INDEX "master_vehicle"."IDX_02a370dd98c5c46cc1ccd63260"`,
    );
    await queryRunner.query(`DROP TABLE "master_vehicle"."vehicle_models"`);
    await queryRunner.query(
      `DROP INDEX "master_vehicle"."IDX_5684a952ad483725670217c180"`,
    );
    await queryRunner.query(
      `DROP INDEX "master_vehicle"."IDX_198957f5c5a1fa53aeaf2a0838"`,
    );
    await queryRunner.query(
      `DROP INDEX "master_vehicle"."IDX_7e9fab2e8625b63613f67bd706"`,
    );
    await queryRunner.query(
      `DROP INDEX "master_vehicle"."IDX_4b1b6a45164d820d7812a99211"`,
    );
    await queryRunner.query(
      `DROP INDEX "master_vehicle"."IDX_9e7084411758d37d9115995e41"`,
    );
    await queryRunner.query(
      `DROP INDEX "master_vehicle"."IDX_d2f8db069bc1f769e63cd191fc"`,
    );
    await queryRunner.query(
      `DROP INDEX "master_vehicle"."IDX_59046774697595e4ddeec7e546"`,
    );
    await queryRunner.query(
      `DROP INDEX "master_vehicle"."IDX_0cf2b97124eb0eb2b0c97f3814"`,
    );
    await queryRunner.query(
      `DROP INDEX "master_vehicle"."IDX_9b5ca17f4e93f005c006d97b97"`,
    );
    await queryRunner.query(
      `DROP INDEX "master_vehicle"."IDX_29b86ed80ea430da8243f2fd78"`,
    );
    await queryRunner.query(
      `DROP INDEX "master_vehicle"."IDX_8b2b9b3559e5f09d2225eb28a7"`,
    );
    await queryRunner.query(`DROP TABLE "master_vehicle"."vehicles"`);
  }
}
