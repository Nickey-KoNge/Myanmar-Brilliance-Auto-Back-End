import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateBranchesTable1773027239238 implements MigrationInterface {
    name = 'CreateBranchesTable1773027239238'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "master_company"."refresh_tokens" DROP CONSTRAINT "FK_refresh_tokens_credential"`);
        await queryRunner.query(`ALTER TABLE "master_company"."staff" DROP CONSTRAINT "FK_staff_credential"`);
        await queryRunner.query(`ALTER TABLE "master_company"."staff" DROP CONSTRAINT "FK_staff_company"`);
        await queryRunner.query(`DROP INDEX "master_company"."IDX_b0fc567cf51b1cf717a9e8046a"`);
        await queryRunner.query(`CREATE TABLE "master_company"."branches" ("id" uuid NOT NULL DEFAULT uuid_generate_v7(), "branches_name" character varying(100) NOT NULL, "gps_location" character varying(50) NOT NULL, "description" character varying(255) NOT NULL, "phone" character varying(20) NOT NULL, "status" character varying(20) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "address" character varying(100) NOT NULL, "city" character varying(50) NOT NULL, "state" character varying(100) NOT NULL, "company_id" uuid NOT NULL, CONSTRAINT "PK_7f37d3b42defea97f1df0d19535" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "master_company"."refresh_tokens" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "master_company"."refresh_tokens" ALTER COLUMN "id" SET DEFAULT uuid_generate_v7()`);
        await queryRunner.query(`ALTER TABLE "master_company"."refresh_tokens" ALTER COLUMN "revoked" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "master_company"."refresh_tokens" ALTER COLUMN "created_at" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "master_company"."refresh_tokens" ALTER COLUMN "credential_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "master_company"."credentials" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "master_company"."credentials" ALTER COLUMN "id" SET DEFAULT uuid_generate_v7()`);
        await queryRunner.query(`ALTER TABLE "master_company"."credentials" DROP COLUMN "password"`);
        await queryRunner.query(`ALTER TABLE "master_company"."credentials" ADD "password" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "master_company"."credentials" ALTER COLUMN "status" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "master_company"."credentials" ALTER COLUMN "created_at" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "master_company"."credentials" ALTER COLUMN "updated_at" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "master_company"."company" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "master_company"."company" ALTER COLUMN "id" SET DEFAULT uuid_generate_v7()`);
        await queryRunner.query(`ALTER TABLE "master_company"."staff" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "master_company"."staff" ALTER COLUMN "id" SET DEFAULT uuid_generate_v7()`);
        await queryRunner.query(`ALTER TABLE "master_company"."staff" ALTER COLUMN "status" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "master_company"."staff" ALTER COLUMN "created_at" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "master_company"."staff" ALTER COLUMN "updated_at" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "master_company"."refresh_tokens" ADD CONSTRAINT "FK_19eaf0aa60f0723c53ac9483ce1" FOREIGN KEY ("credential_id") REFERENCES "master_company"."credentials"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "master_company"."staff" ADD CONSTRAINT "FK_7915a0ef1701c5ee56f716f5590" FOREIGN KEY ("credential_id") REFERENCES "master_company"."credentials"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "master_company"."staff" ADD CONSTRAINT "FK_4e4bf5357315e806b391188d3e1" FOREIGN KEY ("company_id") REFERENCES "master_company"."company"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "master_company"."staff" DROP CONSTRAINT "FK_4e4bf5357315e806b391188d3e1"`);
        await queryRunner.query(`ALTER TABLE "master_company"."staff" DROP CONSTRAINT "FK_7915a0ef1701c5ee56f716f5590"`);
        await queryRunner.query(`ALTER TABLE "master_company"."refresh_tokens" DROP CONSTRAINT "FK_19eaf0aa60f0723c53ac9483ce1"`);
        await queryRunner.query(`ALTER TABLE "master_company"."staff" ALTER COLUMN "updated_at" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "master_company"."staff" ALTER COLUMN "created_at" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "master_company"."staff" ALTER COLUMN "status" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "master_company"."staff" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "master_company"."staff" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "master_company"."company" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "master_company"."company" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "master_company"."credentials" ALTER COLUMN "updated_at" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "master_company"."credentials" ALTER COLUMN "created_at" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "master_company"."credentials" ALTER COLUMN "status" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "master_company"."credentials" DROP COLUMN "password"`);
        await queryRunner.query(`ALTER TABLE "master_company"."credentials" ADD "password" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "master_company"."credentials" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "master_company"."credentials" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "master_company"."refresh_tokens" ALTER COLUMN "credential_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "master_company"."refresh_tokens" ALTER COLUMN "created_at" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "master_company"."refresh_tokens" ALTER COLUMN "revoked" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "master_company"."refresh_tokens" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "master_company"."refresh_tokens" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`DROP TABLE "master_company"."branches"`);
        await queryRunner.query(`CREATE INDEX "IDX_b0fc567cf51b1cf717a9e8046a" ON "master_company"."company" ("email") `);
        await queryRunner.query(`ALTER TABLE "master_company"."staff" ADD CONSTRAINT "FK_staff_company" FOREIGN KEY ("company_id") REFERENCES "master_company"."company"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "master_company"."staff" ADD CONSTRAINT "FK_staff_credential" FOREIGN KEY ("credential_id") REFERENCES "master_company"."credentials"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "master_company"."refresh_tokens" ADD CONSTRAINT "FK_refresh_tokens_credential" FOREIGN KEY ("credential_id") REFERENCES "master_company"."credentials"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
