import { MigrationInterface, QueryRunner } from 'typeorm';

/** Columna para definir si la empresa envía comprobantes al SRI de manera automática o manual */
export class AddAutoSendSriToCompany1794900000000 implements MigrationInterface {
	name = 'AddAutoSendSriToCompany1794900000000';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "tab_company" ADD COLUMN IF NOT EXISTS "auto_send_sri" boolean NOT NULL DEFAULT false;`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "tab_company" DROP COLUMN IF EXISTS "auto_send_sri";`);
	}
}

