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
    moduleIds;
    subModuleIds;
    details;
    constructor(id, code, description, companyId, enabled, createdAt, createdById, moduleIds, subModuleIds, details) {
        this.id = id;
        this.code = code;
        this.description = description;
        this.companyId = companyId;
        this.enabled = enabled;
        this.createdAt = createdAt;
        this.createdById = createdById;
        this.moduleIds = moduleIds;
        this.subModuleIds = subModuleIds;
        this.details = details;
    }
}
exports.Roles = Roles;
//# sourceMappingURL=roles.entity.js.map