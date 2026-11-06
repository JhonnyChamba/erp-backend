"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserCompany = void 0;
class UserCompany {
    id;
    usersId;
    companyId;
    enabled;
    createdAt;
    company;
    constructor(id, usersId, companyId, enabled, createdAt, company) {
        this.id = id;
        this.usersId = usersId;
        this.companyId = companyId;
        this.enabled = enabled;
        this.createdAt = createdAt;
        this.company = company;
    }
}
exports.UserCompany = UserCompany;
//# sourceMappingURL=user-company.entity.js.map