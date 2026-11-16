"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Plans = void 0;
class Plans {
    id;
    price;
    billing_cycle;
    description;
    max_users;
    max_branches;
    enabled;
    created_name;
    createdAt;
    createdById;
    moduleIds;
    constructor(id, price, billing_cycle, description, max_users, max_branches, enabled, created_name, createdAt, createdById, moduleIds) {
        this.id = id;
        this.price = price;
        this.billing_cycle = billing_cycle;
        this.description = description;
        this.max_users = max_users;
        this.max_branches = max_branches;
        this.enabled = enabled;
        this.created_name = created_name;
        this.createdAt = createdAt;
        this.createdById = createdById;
        this.moduleIds = moduleIds;
    }
}
exports.Plans = Plans;
//# sourceMappingURL=plans.entity.js.map