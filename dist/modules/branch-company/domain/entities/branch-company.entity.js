"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BranchCompany = void 0;
class BranchCompany {
    id;
    code;
    name;
    address;
    companyId;
    enabled;
    createdAt;
    createdById;
    constructor(id, code, name, address, companyId, enabled, createdAt, createdById) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.address = address;
        this.companyId = companyId;
        this.enabled = enabled;
        this.createdAt = createdAt;
        this.createdById = createdById;
    }
}
exports.BranchCompany = BranchCompany;
//# sourceMappingURL=branch-company.entity.js.map