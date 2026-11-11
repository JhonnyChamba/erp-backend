import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEmissionPointTables1794600000000 implements MigrationInterface {
	name = 'CreateEmissionPointTables1794600000000';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
			CREATE TABLE IF NOT EXISTS "tab_emission_point" (
				"id" SERIAL PRIMARY KEY,
				"company_id" integer NOT NULL,
				"branch_id" integer NOT NULL,
				"description" character varying(150) NOT NULL,
				"serie" character varying(10) NOT NULL,
				"enabled" boolean NOT NULL DEFAULT true,
				"deleted" boolean NOT NULL DEFAULT false,
				"created_by" integer,
				"created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
				"updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
				CONSTRAINT "FK_emission_point_company" FOREIGN KEY ("company_id") REFERENCES "tab_company"("id") ON DELETE CASCADE,
				CONSTRAINT "FK_emission_point_branch" FOREIGN KEY ("branch_id") REFERENCES "tab_branch_company"("id") ON DELETE CASCADE,
				CONSTRAINT "UQ_emission_point_company_branch_serie" UNIQUE ("company_id", "branch_id", "serie")
			);
		`);

		await queryRunner.query(`
			CREATE TABLE IF NOT EXISTS "tab_emission_point_sequence" (
				"id" SERIAL PRIMARY KEY,
				"company_id" integer NOT NULL,
				"emission_point_id" integer NOT NULL,
				"document_type" character varying(50) NOT NULL,
				"document_code" character varying(10) NOT NULL,
				"serie" character varying(10) NOT NULL,
				"correlative" integer NOT NULL DEFAULT 0,
				"enabled" boolean NOT NULL DEFAULT true,
				"created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
				"updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
				CONSTRAINT "FK_emission_sequence_company" FOREIGN KEY ("company_id") REFERENCES "tab_company"("id") ON DELETE CASCADE,
				CONSTRAINT "FK_emission_sequence_point" FOREIGN KEY ("emission_point_id") REFERENCES "tab_emission_point"("id") ON DELETE CASCADE,
				CONSTRAINT "UQ_emission_sequence_point_doc" UNIQUE ("emission_point_id", "document_type")
			);
		`);

		await queryRunner.query(`
			CREATE INDEX IF NOT EXISTS "IDX_emission_point_company_branch" ON "tab_emission_point" ("company_id", "branch_id");
			CREATE INDEX IF NOT EXISTS "IDX_emission_sequence_point" ON "tab_emission_point_sequence" ("emission_point_id");
		`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP TABLE IF EXISTS "tab_emission_point_sequence"`);
		await queryRunner.query(`DROP TABLE IF EXISTS "tab_emission_point"`);
	}
}

