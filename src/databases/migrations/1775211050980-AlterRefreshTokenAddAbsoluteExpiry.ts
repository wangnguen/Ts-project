import { MigrationInterface, QueryRunner } from 'typeorm'

export class AlterRefreshTokenAddAbsoluteExpiry1775211050980 implements MigrationInterface {
  name = 'AlterRefreshTokenAddAbsoluteExpiry1775211050980'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_3ddc983c5f7bcf132fd8732c3f4"`)
    await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD "absolute_expires_at" TIMESTAMP NOT NULL`)
    await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP CONSTRAINT "UQ_4542dd2f38a61354a040ba9fd57"`)
    await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP COLUMN "token"`)
    await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD "token" text NOT NULL`)
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ADD CONSTRAINT "UQ_4542dd2f38a61354a040ba9fd57" UNIQUE ("token")`
    )
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ADD CONSTRAINT "FK_3ddc983c5f7bcf132fd8732c3f4" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_3ddc983c5f7bcf132fd8732c3f4"`)
    await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP CONSTRAINT "UQ_4542dd2f38a61354a040ba9fd57"`)
    await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP COLUMN "token"`)
    await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD "token" character varying(255) NOT NULL`)
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ADD CONSTRAINT "UQ_4542dd2f38a61354a040ba9fd57" UNIQUE ("token")`
    )
    await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP COLUMN "absolute_expires_at"`)
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ADD CONSTRAINT "FK_3ddc983c5f7bcf132fd8732c3f4" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }
}
