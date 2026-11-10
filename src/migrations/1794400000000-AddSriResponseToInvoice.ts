import { MigrationInterface, QueryRunner } from 'typeorm';

/** Columnas para guardar la respuesta del SRI (recepción/autorización) en la factura. */
export class AddSriResponseToInvoice1794400000000 implements MigrationInterface {
	name = 'AddSriResponseToInvoice1794400000000';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "tab_invoice" ADD COLUMN IF NOT EXISTS "sri_status" character varying(20) NOT NULL DEFAULT 'NOT_SENT'`);
		await queryRunner.query(`ALTER TABLE "tab_invoice" ADD COLUMN IF NOT EXISTS "sri_authorization_number" character varying(49)`);
		await queryRunner.query(`ALTER TABLE "tab_invoice" ADD COLUMN IF NOT EXISTS "sri_authorization_date" TIMESTAMP`);
		await queryRunner.query(`ALTER TABLE "tab_invoice" ADD COLUMN IF NOT EXISTS "sri_sent_at" TIMESTAMP`);
		await queryRunner.query(`ALTER TABLE "tab_invoice" ADD COLUMN IF NOT EXISTS "sri_messages" jsonb`);
		await queryRunner.query(`ALTER TABLE "tab_invoice" ADD COLUMN IF NOT EXISTS "sri_response_xml" text`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "tab_invoice" DROP COLUMN IF EXISTS "sri_response_xml"`);
		await queryRunner.query(`ALTER TABLE "tab_invoice" DROP COLUMN IF EXISTS "sri_messages"`);
		await queryRunner.query(`ALTER TABLE "tab_invoice" DROP COLUMN IF EXISTS "sri_sent_at"`);
		await queryRunner.query(`ALTER TABLE "tab_invoice" DROP COLUMN IF EXISTS "sri_authorization_date"`);
		await queryRunner.query(`ALTER TABLE "tab_invoice" DROP COLUMN IF EXISTS "sri_authorization_number"`);
		await queryRunner.query(`ALTER TABLE "tab_invoice" DROP COLUMN IF EXISTS "sri_status"`);
	}
}
