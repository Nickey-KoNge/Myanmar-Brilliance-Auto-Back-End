import { MigrationInterface, QueryRunner } from 'typeorm';

export class CompanyTable1771234858616 implements MigrationInterface {
  name = 'CompanyTable1771234858616';

  public async up(queryRunner: QueryRunner): Promise<void> {
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
      `CREATE TABLE "master_company"."company" ("id" uuid NOT NULL DEFAULT uuid_generate_v7(), "company_name" character varying(100) NOT NULL, "reg_number" character varying(50) NOT NULL, "phone" character varying(20) NOT NULL, "email" character varying(100) NOT NULL, "country" character varying(50) NOT NULL, "city" character varying(50) NOT NULL, "street_address" character varying(100) NOT NULL, "website_url" character varying(100), "establish_year" date NOT NULL, "reg_exp_date" date NOT NULL, "image" character varying(500), "status" character varying(20) NOT NULL DEFAULT 'Active', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_902430c8a07a28218984bc8c81d" UNIQUE ("reg_number"), CONSTRAINT "UQ_e53ef0697f9d5d933fa075be1c3" UNIQUE ("phone"), CONSTRAINT "UQ_b0fc567cf51b1cf717a9e8046a1" UNIQUE ("email"), CONSTRAINT "PK_056f7854a7afdba7cbd6d45fc20" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_831e30688ec18c3fe41894e6b0" ON "master_company"."company" ("company_name") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b0fc567cf51b1cf717a9e8046a" ON "master_company"."company" ("email") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "master_company"."IDX_b0fc567cf51b1cf717a9e8046a"`,
    );
    await queryRunner.query(
      `DROP INDEX "master_company"."IDX_831e30688ec18c3fe41894e6b0"`,
    );
    await queryRunner.query(`DROP TABLE "master_company"."company"`);
  }
}
