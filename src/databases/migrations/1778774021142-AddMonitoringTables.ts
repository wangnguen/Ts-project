import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddMonitoringTables1778774021142 implements MigrationInterface {
  name = 'AddMonitoringTables1778774021142'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."monitors_type_enum" AS ENUM('http', 'https', 'tcp', 'ping')`)
    await queryRunner.query(`CREATE TYPE "public"."monitors_current_status_enum" AS ENUM('up', 'down', 'pending')`)
    await queryRunner.query(
      `CREATE TABLE "monitors" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying(100) NOT NULL, "type" "public"."monitors_type_enum" NOT NULL, "target" text NOT NULL, "interval" integer NOT NULL DEFAULT '60', "timeout" integer NOT NULL DEFAULT '30', "retries" integer NOT NULL DEFAULT '1', "is_active" boolean NOT NULL DEFAULT true, "current_status" "public"."monitors_current_status_enum" NOT NULL DEFAULT 'pending', "last_checked_at" TIMESTAMP, "accepted_status_codes" text, "keyword" text, "user_id" uuid NOT NULL, CONSTRAINT "PK_193902e2013887310490284cdbe" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `ALTER TABLE "monitors" ADD CONSTRAINT "FK_e14d6e8ea5eb39ace280a3b7c23" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "monitors" DROP CONSTRAINT "FK_e14d6e8ea5eb39ace280a3b7c23"`)
    await queryRunner.query(`DROP TABLE "monitors"`)
    await queryRunner.query(`DROP TYPE "public"."monitors_current_status_enum"`)
    await queryRunner.query(`DROP TYPE "public"."monitors_type_enum"`)
  }
}
