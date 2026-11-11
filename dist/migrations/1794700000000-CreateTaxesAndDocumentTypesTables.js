"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTaxesAndDocumentTypesTables1794700000000 = void 0;
class CreateTaxesAndDocumentTypesTables1794700000000 {
    name = 'CreateTaxesAndDocumentTypesTables1794700000000';
    async up(queryRunner) {
        await queryRunner.query(`
			CREATE TABLE IF NOT EXISTS "tab_taxes" (
				"id" SERIAL PRIMARY KEY,
				"company_id" integer NOT NULL,
				"code" character varying(50) NOT NULL,
				"percentage" numeric(5,2) NOT NULL DEFAULT 0,
				"description" character varying(250) NOT NULL,
				"status" character varying(20) NOT NULL DEFAULT 'ACTIVO',
				"is_default" boolean NOT NULL DEFAULT false,
				"deleted" boolean NOT NULL DEFAULT false,
				"created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
				"updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
				CONSTRAINT "FK_tab_taxes_company" FOREIGN KEY ("company_id") REFERENCES "tab_company"("id") ON DELETE CASCADE
			);
		`);
        await queryRunner.query(`
			CREATE INDEX IF NOT EXISTS "IDX_tab_taxes_company" ON "tab_taxes" ("company_id");
		`);
        await queryRunner.query(`
			CREATE TABLE IF NOT EXISTS "tab_document_types" (
				"id" SERIAL PRIMARY KEY,
				"company_id" integer NOT NULL,
				"name" character varying(150) NOT NULL,
				"type" character varying(50) NOT NULL DEFAULT 'TODOS',
				"code" character varying(20) NOT NULL,
				"status" character varying(20) NOT NULL DEFAULT 'ACTIVO',
				"deleted" boolean NOT NULL DEFAULT false,
				"created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
				"updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
				CONSTRAINT "FK_tab_doc_types_company" FOREIGN KEY ("company_id") REFERENCES "tab_company"("id") ON DELETE CASCADE
			);
		`);
        await queryRunner.query(`
			CREATE INDEX IF NOT EXISTS "IDX_tab_document_types_company" ON "tab_document_types" ("company_id");
		`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE IF EXISTS "tab_document_types";`);
        await queryRunner.query(`DROP TABLE IF EXISTS "tab_taxes";`);
    }
}
exports.CreateTaxesAndDocumentTypesTables1794700000000 = CreateTaxesAndDocumentTypesTables1794700000000;
//# sourceMappingURL=1794700000000-CreateTaxesAndDocumentTypesTables.js.map