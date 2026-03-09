import { MigrationInterface, QueryRunner } from "typeorm";

export class BranchTable1772772393854 implements MigrationInterface {
    name = 'BranchTable1772772393854'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "branches" ("id" uuid NOT NULL DEFAULT uuid_generate_v7(), "branches_name" character varying(100) NOT NULL, "gps_location" character varying(50) NOT NULL, "description" character varying(255) NOT NULL, "phone" character varying(20) NOT NULL, "status" character varying(20) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "address" character varying(100) NOT NULL, "city" character varying(50) NOT NULL, "state" character varying(100) NOT NULL, "company_id" character varying(50) NOT NULL, CONSTRAINT "PK_7f37d3b42defea97f1df0d19535" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "branches"`);
    }

}
