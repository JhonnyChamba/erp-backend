import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDivisionGroupsTable1796000000000 implements MigrationInterface {
  name = 'CreateDivisionGroupsTable1796000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "tab_campeonato_division_groups" (
        "id" SERIAL PRIMARY KEY,
        "company_id" integer NOT NULL,
        "code" varchar(50) NOT NULL,
        "description" varchar(200) NOT NULL,
        "enabled" boolean NOT NULL DEFAULT true,
        "deleted" boolean NOT NULL DEFAULT false,
        "created_name" varchar,
        "created_by" varchar,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "update_name" varchar,
        "updated_by" varchar,
        "updated_at" timestamp DEFAULT now(),
        CONSTRAINT "UQ_tab_campeonato_division_groups_company_code" UNIQUE ("company_id", "code")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "tab_campeonato_division_groups"`);
  }
}
