"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Company = void 0;
class Company {
    id;
    ruc;
    description;
    business_name;
    trade_name;
    enabled;
    deleted;
    created_name;
    createdAt;
    createdById;
    fiscal;
    secrets;
    constructor(id, ruc, description, business_name, trade_name, enabled, deleted, created_name, createdAt, createdById, fiscal = {}, secrets = {}) {
        this.id = id;
        this.ruc = ruc;
        this.description = description;
        this.business_name = business_name;
        this.trade_name = trade_name;
        this.enabled = enabled;
        this.deleted = deleted;
        this.created_name = created_name;
        this.createdAt = createdAt;
        this.createdById = createdById;
        this.fiscal = fiscal;
        this.secrets = secrets;
    }
}
exports.Company = Company;
//# sourceMappingURL=company.entity.js.map