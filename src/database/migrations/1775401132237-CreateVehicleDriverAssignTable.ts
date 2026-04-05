import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateVehicleDriverAssignTable1775401132237 implements MigrationInterface {
  name = 'CreateVehicleDriverAssignTable1775401132237';

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
      `CREATE TABLE "master_vehicle"."driver_assigns" ("id" uuid NOT NULL DEFAULT uuid_generate_v7(), "driver_id" uuid NOT NULL, "vehicle_id" uuid NOT NULL, "assigned_at" date, "returned_at" date, "start_odometer" character varying(10), "end_odometer" character varying(10), "status" character varying(20) NOT NULL DEFAULT 'Active', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "station_id" uuid, CONSTRAINT "PK_79115f30cfc2c297bbd4d359569" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bee9d5e4224d5141106da671bb" ON "master_vehicle"."driver_assigns" ("driver_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3d48d890e934ce3e74c2949371" ON "master_vehicle"."driver_assigns" ("vehicle_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d25222fbe2a9c124f8ccd9dbae" ON "master_vehicle"."driver_assigns" ("status") `,
    );
    await queryRunner.query(
      `ALTER TABLE "master_vehicle"."vehicle_models" DROP CONSTRAINT "FK_b8f74f8091616bbedf5be859e1a"`,
    );
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
      `ALTER TABLE "master_vehicle"."vehicles" DROP CONSTRAINT "FK_29b86ed80ea430da8243f2fd78c"`,
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
      `ALTER TABLE "master_vehicle"."vehicles" DROP CONSTRAINT "FK_9b5ca17f4e93f005c006d97b978"`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."groups" ALTER COLUMN "id" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."groups" ALTER COLUMN "id" SET DEFAULT uuid_generate_v7()`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_vehicle"."vehicles" ALTER COLUMN "id" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_vehicle"."vehicles" ALTER COLUMN "id" SET DEFAULT uuid_generate_v7()`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_vehicle"."vehicles" DROP CONSTRAINT "FK_0cf2b97124eb0eb2b0c97f3814d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_vehicle"."vehicle_models" ALTER COLUMN "id" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_vehicle"."vehicle_models" ALTER COLUMN "id" SET DEFAULT uuid_generate_v7()`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_audit"."audit" ALTER COLUMN "id" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_audit"."audit" ALTER COLUMN "id" SET DEFAULT uuid_generate_v7()`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."refresh_tokens" ADD CONSTRAINT "FK_19eaf0aa60f0723c53ac9483ce1" FOREIGN KEY ("credential_id") REFERENCES "master_company"."credentials"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_vehicle"."driver_assigns" ADD CONSTRAINT "FK_bee9d5e4224d5141106da671bb6" FOREIGN KEY ("driver_id") REFERENCES "master_company"."driver"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_vehicle"."driver_assigns" ADD CONSTRAINT "FK_3d48d890e934ce3e74c2949371b" FOREIGN KEY ("vehicle_id") REFERENCES "master_vehicle"."vehicles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_vehicle"."driver_assigns" ADD CONSTRAINT "FK_8923636ae3a14b6c82c3ef9a86c" FOREIGN KEY ("station_id") REFERENCES "master_company"."stations"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
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
      `ALTER TABLE "master_vehicle"."driver_assigns" DROP CONSTRAINT "FK_8923636ae3a14b6c82c3ef9a86c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_vehicle"."driver_assigns" DROP CONSTRAINT "FK_3d48d890e934ce3e74c2949371b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_vehicle"."driver_assigns" DROP CONSTRAINT "FK_bee9d5e4224d5141106da671bb6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."refresh_tokens" DROP CONSTRAINT "FK_19eaf0aa60f0723c53ac9483ce1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_audit"."audit" ALTER COLUMN "id" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_audit"."audit" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_vehicle"."vehicle_models" ALTER COLUMN "id" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_vehicle"."vehicle_models" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_vehicle"."vehicles" ADD CONSTRAINT "FK_0cf2b97124eb0eb2b0c97f3814d" FOREIGN KEY ("vehicle_model_id") REFERENCES "master_vehicle"."vehicle_models"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_vehicle"."vehicles" ALTER COLUMN "id" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_vehicle"."vehicles" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."groups" ALTER COLUMN "id" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_company"."groups" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_vehicle"."vehicles" ADD CONSTRAINT "FK_9b5ca17f4e93f005c006d97b978" FOREIGN KEY ("group_id") REFERENCES "master_company"."groups"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
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
      `ALTER TABLE "master_vehicle"."vehicles" ADD CONSTRAINT "FK_29b86ed80ea430da8243f2fd78c" FOREIGN KEY ("station_id") REFERENCES "master_company"."stations"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
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
      `ALTER TABLE "master_vehicle"."vehicle_brands" ALTER COLUMN "id" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_vehicle"."vehicle_brands" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_vehicle"."vehicle_models" ADD CONSTRAINT "FK_b8f74f8091616bbedf5be859e1a" FOREIGN KEY ("vehicle_brand_id") REFERENCES "master_vehicle"."vehicle_brands"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `DROP INDEX "master_vehicle"."IDX_d25222fbe2a9c124f8ccd9dbae"`,
    );
    await queryRunner.query(
      `DROP INDEX "master_vehicle"."IDX_3d48d890e934ce3e74c2949371"`,
    );
    await queryRunner.query(
      `DROP INDEX "master_vehicle"."IDX_bee9d5e4224d5141106da671bb"`,
    );
    await queryRunner.query(`DROP TABLE "master_vehicle"."driver_assigns"`);
  }
}
