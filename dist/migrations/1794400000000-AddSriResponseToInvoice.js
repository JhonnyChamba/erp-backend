"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddSriResponseToInvoice1794400000000 = void 0;
class AddSriResponseToInvoice1794400000000 {
    name = 'AddSriResponseToInvoice1794400000000';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "tab_invoice" ADD COLUMN IF NOT EXISTS "sri_status" character varying(20) NOT NULL DEFAULT 'NOT_SENT'`);
        await queryRunner.query(`ALTER TABLE "tab_invoice" ADD COLUMN IF NOT EXISTS "sri_authorization_number" character varying(49)`);
        await queryRunner.query(`ALTER TABLE "tab_invoice" ADD COLUMN IF NOT EXISTS "sri_authorization_date" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "tab_invoice" ADD COLUMN IF NOT EXISTS "sri_sent_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "tab_invoice" ADD COLUMN IF NOT EXISTS "sri_messages" jsonb`);
        await queryRunner.query(`ALTER TABLE "tab_invoice" ADD COLUMN IF NOT EXISTS "sri_response_xml" text`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "tab_invoice" DROP COLUMN IF EXISTS "sri_response_xml"`);
        await queryRunner.query(`ALTER TABLE "tab_invoice" DROP COLUMN IF EXISTS "sri_messages"`);
        await queryRunner.query(`ALTER TABLE "tab_invoice" DROP COLUMN IF EXISTS "sri_sent_at"`);
        await queryRunner.query(`ALTER TABLE "tab_invoice" DROP COLUMN IF EXISTS "sri_authorization_date"`);
        await queryRunner.query(`ALTER TABLE "tab_invoice" DROP COLUMN IF EXISTS "sri_authorization_number"`);
        await queryRunner.query(`ALTER TABLE "tab_invoice" DROP COLUMN IF EXISTS "sri_status"`);
    }
}
exports.AddSriResponseToInvoice1794400000000 = AddSriResponseToInvoice1794400000000;
//# sourceMappingURL=1794400000000-AddSriResponseToInvoice.js.map