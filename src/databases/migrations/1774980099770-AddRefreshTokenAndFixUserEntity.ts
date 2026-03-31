import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddRefreshTokenAndFixUserEntity1774980099770 implements MigrationInterface {
  name = 'AddRefreshTokenAndFixUserEntity1774980099770'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "refresh_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "token" character varying(255) NOT NULL, "user_id" uuid NOT NULL, "expires_at" TIMESTAMP NOT NULL, CONSTRAINT "UQ_4542dd2f38a61354a040ba9fd57" UNIQUE ("token"), CONSTRAINT "PK_7d8bee0204106019488c4c50ffa" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(`ALTER TABLE "users" ADD "isVerified" boolean NOT NULL DEFAULT false`)
    await queryRunner.query(`ALTER TABLE "users" ADD "last_login_at" TIMESTAMP`)
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ADD CONSTRAINT "FK_3ddc983c5f7bcf132fd8732c3f4" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_3ddc983c5f7bcf132fd8732c3f4"`)
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "last_login_at"`)
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "isVerified"`)
    await queryRunner.query(`DROP TABLE "refresh_tokens"`)
  }
}
