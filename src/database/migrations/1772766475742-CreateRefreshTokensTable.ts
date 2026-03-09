import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRefreshTokensTable1771252000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "master_company"."refresh_tokens" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v7(),
        "refresh_token" varchar(500) NOT NULL,
        "expires_at" TIMESTAMP NOT NULL,
        "revoked" boolean DEFAULT false,
        "credential_id" uuid NOT NULL,
        "created_at" TIMESTAMP DEFAULT now(),
        CONSTRAINT "PK_refresh_tokens" PRIMARY KEY ("id"),
        CONSTRAINT "FK_refresh_tokens_credential" FOREIGN KEY ("credential_id") 
            REFERENCES "master_company"."credentials"("id") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "master_company"."refresh_tokens"`);
  }
}