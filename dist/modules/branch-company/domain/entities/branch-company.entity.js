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
    emissionPoint;
    phone;
    email;
    isMatrix;
    logoUrl;
    constructor(id, code, name, address, companyId, enabled, createdAt, createdById, emissionPoint = '001', phone = null, email = null, isMatrix = false, logoUrl = null) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.address = address;
        this.companyId = companyId;
        this.enabled = enabled;
        this.createdAt = createdAt;
        this.createdById = createdById;
        this.emissionPoint = emissionPoint;
        this.phone = phone;
        this.email = email;
        this.isMatrix = isMatrix;
        this.logoUrl = logoUrl;
    }
}
exports.BranchCompany = BranchCompany;
//# sourceMappingURL=branch-company.entity.js.map