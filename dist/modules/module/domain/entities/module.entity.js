"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Module = void 0;
class Module {
    id;
    code;
    desc_icon;
    description;
    enabled;
    createdAt;
    createdById;
    constructor(id, code, desc_icon, description, enabled, createdAt, createdById) {
        this.id = id;
        this.code = code;
        this.desc_icon = desc_icon;
        this.description = description;
        this.enabled = enabled;
        this.createdAt = createdAt;
        this.createdById = createdById;
    }
}
exports.Module = Module;
//# sourceMappingURL=module.entity.js.map