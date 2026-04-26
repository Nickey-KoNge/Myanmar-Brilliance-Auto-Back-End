import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRentalAndFinance1776333581077 implements MigrationInterface {
  name = 'CreateRentalAndFinance1776333581077';

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

    // --- Create Tables & Indexes ---

    await queryRunner.query(
      `CREATE TABLE "master_trips"."trip_prices" ("id" uuid NOT NULL DEFAULT uuid_generate_v7(), "route_id" uuid NOT NULL, "vehicle_model_id" uuid NOT NULL, "station_id" uuid NOT NULL, "daily_trip_rate" character varying(10) NOT NULL, "overnight_trip_rate" character varying(10) NOT NULL, "status" character varying(20) NOT NULL DEFAULT 'Active', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7eb15adede4ed664c4b76831df4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9b41cd5a92e84899623fe128d4" ON "master_trips"."trip_prices" ("route_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c0a0506e2665d4fff10b728768" ON "master_trips"."trip_prices" ("vehicle_model_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2631ec2caffe8abbfe8f7cb1af" ON "master_trips"."trip_prices" ("station_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_29760546250ac756bc679e0283" ON "master_trips"."trip_prices" ("status") `,
    );

    await queryRunner.query(
      `CREATE TABLE "master_rental"."trip_finances" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "trip_id" uuid NOT NULL, "staff_id" uuid NOT NULL, "rental_amount" character varying(20), "overtime_amount" character varying(20), "refund_amount" character varying(20), "total" character varying(20), "payment_status" character varying(20) NOT NULL DEFAULT 'Pending', "status" character varying(20) NOT NULL DEFAULT 'Active', "receive_date" date, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_85fd3e1812ad6329ad8507caa1e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_db1d2cebf760c3ed1ba6d0cdaf" ON "master_rental"."trip_finances" ("trip_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_544541e657ff45a1698bb6bd85" ON "master_rental"."trip_finances" ("staff_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_68d77a5090ea4d79829e4b7f68" ON "master_rental"."trip_finances" ("payment_status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8a2149eaaee1c494d3288f3adb" ON "master_rental"."trip_finances" ("status") `,
    );

    await queryRunner.query(
      `CREATE TABLE "master_rental"."rental_operations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "route_id" uuid NOT NULL, "vehicle_id" uuid NOT NULL, "driver_id" uuid NOT NULL, "station_id" uuid NOT NULL, "daily_count" character varying(2), "description" character varying(255), "start_time" TIMESTAMP, "end_time" TIMESTAMP, "start_odo" character varying(10), "end_odo" character varying(10), "start_battery" character varying(3), "end_battery" character varying(3), "extra_hours" character varying(2), "overnight_count" character varying(2), "trip_status" character varying(20) NOT NULL DEFAULT 'Pending', "distance" character varying(5), "power_station_name" character varying(50), "kw" character varying(10), "amount" character varying(20), "status" character varying(20) NOT NULL DEFAULT 'Active', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ec5a520dc8cdf63ef6a8078bb66" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c5f395c2ef32517182022460a7" ON "master_rental"."rental_operations" ("route_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_eca73faba4c0d5decfbd5518aa" ON "master_rental"."rental_operations" ("vehicle_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8ac7d17ccd0be395c314d06e2d" ON "master_rental"."rental_operations" ("driver_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0c4eed8c72d5e6bb9edd5b67ef" ON "master_rental"."rental_operations" ("station_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d5d447f6e0d7de11dde4c3d869" ON "master_rental"."rental_operations" ("trip_status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9218f0ead8be64b47debe69829" ON "master_rental"."rental_operations" ("status") `,
    );

    // --- Add Foreign Key Constraints (Only for newly created tables) ---

    await queryRunner.query(
      `ALTER TABLE "master_trips"."trip_prices" ADD CONSTRAINT "FK_9b41cd5a92e84899623fe128d4e" FOREIGN KEY ("route_id") REFERENCES "master_trips"."route"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_trips"."trip_prices" ADD CONSTRAINT "FK_c0a0506e2665d4fff10b7287681" FOREIGN KEY ("vehicle_model_id") REFERENCES "master_vehicle"."vehicle_models"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_trips"."trip_prices" ADD CONSTRAINT "FK_2631ec2caffe8abbfe8f7cb1afd" FOREIGN KEY ("station_id") REFERENCES "master_company"."stations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "master_rental"."trip_finances" ADD CONSTRAINT "FK_db1d2cebf760c3ed1ba6d0cdaf7" FOREIGN KEY ("trip_id") REFERENCES "master_rental"."rental_operations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_rental"."trip_finances" ADD CONSTRAINT "FK_544541e657ff45a1698bb6bd857" FOREIGN KEY ("staff_id") REFERENCES "master_company"."staff"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "master_rental"."rental_operations" ADD CONSTRAINT "FK_c5f395c2ef32517182022460a78" FOREIGN KEY ("route_id") REFERENCES "master_trips"."route"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_rental"."rental_operations" ADD CONSTRAINT "FK_eca73faba4c0d5decfbd5518aa3" FOREIGN KEY ("vehicle_id") REFERENCES "master_vehicle"."vehicles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_rental"."rental_operations" ADD CONSTRAINT "FK_8ac7d17ccd0be395c314d06e2dc" FOREIGN KEY ("driver_id") REFERENCES "master_company"."driver"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_rental"."rental_operations" ADD CONSTRAINT "FK_0c4eed8c72d5e6bb9edd5b67ef3" FOREIGN KEY ("station_id") REFERENCES "master_company"."stations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // --- Remove Foreign Key Constraints ---
    await queryRunner.query(
      `ALTER TABLE "master_rental"."rental_operations" DROP CONSTRAINT "FK_0c4eed8c72d5e6bb9edd5b67ef3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_rental"."rental_operations" DROP CONSTRAINT "FK_8ac7d17ccd0be395c314d06e2dc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_rental"."rental_operations" DROP CONSTRAINT "FK_eca73faba4c0d5decfbd5518aa3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_rental"."rental_operations" DROP CONSTRAINT "FK_c5f395c2ef32517182022460a78"`,
    );

    await queryRunner.query(
      `ALTER TABLE "master_rental"."trip_finances" DROP CONSTRAINT "FK_544541e657ff45a1698bb6bd857"`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_rental"."trip_finances" DROP CONSTRAINT "FK_db1d2cebf760c3ed1ba6d0cdaf7"`,
    );

    await queryRunner.query(
      `ALTER TABLE "master_trips"."trip_prices" DROP CONSTRAINT "FK_2631ec2caffe8abbfe8f7cb1afd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_trips"."trip_prices" DROP CONSTRAINT "FK_c0a0506e2665d4fff10b7287681"`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_trips"."trip_prices" DROP CONSTRAINT "FK_9b41cd5a92e84899623fe128d4e"`,
    );

    // --- Drop Indexes & Tables ---
    await queryRunner.query(
      `DROP INDEX "master_rental"."IDX_9218f0ead8be64b47debe69829"`,
    );
    await queryRunner.query(
      `DROP INDEX "master_rental"."IDX_d5d447f6e0d7de11dde4c3d869"`,
    );
    await queryRunner.query(
      `DROP INDEX "master_rental"."IDX_0c4eed8c72d5e6bb9edd5b67ef"`,
    );
    await queryRunner.query(
      `DROP INDEX "master_rental"."IDX_8ac7d17ccd0be395c314d06e2d"`,
    );
    await queryRunner.query(
      `DROP INDEX "master_rental"."IDX_eca73faba4c0d5decfbd5518aa"`,
    );
    await queryRunner.query(
      `DROP INDEX "master_rental"."IDX_c5f395c2ef32517182022460a7"`,
    );
    await queryRunner.query(`DROP TABLE "master_rental"."rental_operations"`);

    await queryRunner.query(
      `DROP INDEX "master_rental"."IDX_8a2149eaaee1c494d3288f3adb"`,
    );
    await queryRunner.query(
      `DROP INDEX "master_rental"."IDX_68d77a5090ea4d79829e4b7f68"`,
    );
    await queryRunner.query(
      `DROP INDEX "master_rental"."IDX_544541e657ff45a1698bb6bd85"`,
    );
    await queryRunner.query(
      `DROP INDEX "master_rental"."IDX_db1d2cebf760c3ed1ba6d0cdaf"`,
    );
    await queryRunner.query(`DROP TABLE "master_rental"."trip_finances"`);

    await queryRunner.query(
      `DROP INDEX "master_trips"."IDX_29760546250ac756bc679e0283"`,
    );
    await queryRunner.query(
      `DROP INDEX "master_trips"."IDX_2631ec2caffe8abbfe8f7cb1af"`,
    );
    await queryRunner.query(
      `DROP INDEX "master_trips"."IDX_c0a0506e2665d4fff10b728768"`,
    );
    await queryRunner.query(
      `DROP INDEX "master_trips"."IDX_9b41cd5a92e84899623fe128d4"`,
    );
    await queryRunner.query(`DROP TABLE "master_trips"."trip_prices"`);
  }
}
