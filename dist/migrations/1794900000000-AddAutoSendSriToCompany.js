"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddAutoSendSriToCompany1794900000000 = void 0;
class AddAutoSendSriToCompany1794900000000 {
    name = 'AddAutoSendSriToCompany1794900000000';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "tab_company" ADD COLUMN IF NOT EXISTS "auto_send_sri" boolean NOT NULL DEFAULT false;`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "tab_company" DROP COLUMN IF EXISTS "auto_send_sri";`);
    }
}
exports.AddAutoSendSriToCompany1794900000000 = AddAutoSendSriToCompany1794900000000;
//# sourceMappingURL=1794900000000-AddAutoSendSriToCompany.js.map