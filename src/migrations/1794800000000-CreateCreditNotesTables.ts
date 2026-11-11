import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCreditNotesTables1794800000000 implements MigrationInterface {
	name = 'CreateCreditNotesTables1794800000000';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
			CREATE TABLE IF NOT EXISTS "tab_credit_note" (
				"id" SERIAL PRIMARY KEY,
				"company_id" integer NOT NULL,
				"invoice_id" integer,
				"branch_id" integer,
				"branch_address" character varying(300),
				"establishment" character varying(3) NOT NULL DEFAULT '001',
				"emission_point" character varying(3) NOT NULL DEFAULT '001',
				"sequential" character varying(9) NOT NULL,
				"credit_note_number" character varying(25) NOT NULL,
				"issue_date" date NOT NULL,
				"modified_document_type" character varying(2) NOT NULL DEFAULT '01',
				"modified_document_number" character varying(25) NOT NULL,
				"modified_document_date" date,
				"reason" character varying(300) NOT NULL,
				"customer_id_type" character varying(2) NOT NULL DEFAULT '05',
				"customer_id_number" character varying(20) NOT NULL,
				"customer_name" character varying(200) NOT NULL,
				"customer_address" character varying(200),
				"customer_email" character varying(100),
				"customer_phone" character varying(25),
				"access_key" character varying(49),
				"status" character varying(20) NOT NULL DEFAULT 'ISSUED',
				"subtotal_zero_tax" numeric(12,2) NOT NULL DEFAULT 0,
				"subtotal_taxable" numeric(12,2) NOT NULL DEFAULT 0,
				"subtotal" numeric(12,2) NOT NULL DEFAULT 0,
				"discount_total" numeric(12,2) NOT NULL DEFAULT 0,
				"tax_total" numeric(12,2) NOT NULL DEFAULT 0,
				"total" numeric(12,2) NOT NULL DEFAULT 0,
				"adjust_inventory" boolean NOT NULL DEFAULT true,
				"notes" text,
				"signed_xml" text,
				"signed_at" TIMESTAMP WITH TIME ZONE,
				"sign_status" character varying(20) NOT NULL DEFAULT 'NOT_SIGNED',
				"sri_status" character varying(20) NOT NULL DEFAULT 'NOT_SENT',
				"sri_authorization_number" character varying(49),
				"sri_authorization_date" TIMESTAMP WITH TIME ZONE,
				"sri_sent_at" TIMESTAMP WITH TIME ZONE,
				"sri_messages" jsonb,
				"sri_response_xml" text,
				"created_by" integer,
				"enabled" boolean NOT NULL DEFAULT true,
				"deleted" boolean NOT NULL DEFAULT false,
				"created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
				"updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
				CONSTRAINT "FK_credit_note_company" FOREIGN KEY ("company_id") REFERENCES "tab_company"("id") ON DELETE CASCADE,
				CONSTRAINT "FK_credit_note_invoice" FOREIGN KEY ("invoice_id") REFERENCES "tab_invoice"("id") ON DELETE SET NULL,
				CONSTRAINT "UQ_credit_note_company_number" UNIQUE ("company_id", "credit_note_number")
			);
		`);

		await queryRunner.query(`
			CREATE TABLE IF NOT EXISTS "tab_credit_note_detail" (
				"id" SERIAL PRIMARY KEY,
				"credit_note_id" integer NOT NULL,
				"item_type" character varying(20) NOT NULL DEFAULT 'PRODUCT',
				"item_id" integer,
				"warehouse_id" integer,
				"code" character varying(30),
				"description" character varying(250) NOT NULL,
				"quantity" numeric(12,4) NOT NULL DEFAULT 1,
				"unit_price" numeric(12,4) NOT NULL DEFAULT 0,
				"discount" numeric(12,2) NOT NULL DEFAULT 0,
				"tax_rate" numeric(5,2) NOT NULL DEFAULT 15,
				"tax_value" numeric(12,2) NOT NULL DEFAULT 0,
				"subtotal" numeric(12,2) NOT NULL DEFAULT 0,
				"total" numeric(12,2) NOT NULL DEFAULT 0,
				CONSTRAINT "FK_credit_note_detail_credit_note" FOREIGN KEY ("credit_note_id") REFERENCES "tab_credit_note"("id") ON DELETE CASCADE
			);
		`);

		await queryRunner.query(`
			CREATE INDEX IF NOT EXISTS "IDX_credit_note_company" ON "tab_credit_note" ("company_id");
			CREATE INDEX IF NOT EXISTS "IDX_credit_note_invoice" ON "tab_credit_note" ("invoice_id");
			CREATE INDEX IF NOT EXISTS "IDX_credit_note_detail_note" ON "tab_credit_note_detail" ("credit_note_id");
		`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP TABLE IF EXISTS "tab_credit_note_detail";`);
		await queryRunner.query(`DROP TABLE IF EXISTS "tab_credit_note";`);
	}
}

