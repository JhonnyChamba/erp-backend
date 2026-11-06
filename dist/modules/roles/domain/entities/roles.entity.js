"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Roles = void 0;
class Roles {
    id;
    code;
    description;
    companyId;
    enabled;
    createdAt;
    createdById;
    constructor(id, code, description, companyId, enabled, createdAt, createdById) {
        this.id = id;
        this.code = code;
        this.description = description;
        this.companyId = companyId;
        this.enabled = enabled;
        this.createdAt = createdAt;
        this.createdById = createdById;
    }
}
exports.Roles = Roles;
//# sourceMappingURL=roles.entity.js.map