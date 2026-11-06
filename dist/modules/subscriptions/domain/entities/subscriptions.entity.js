"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Subscriptions = void 0;
class Subscriptions {
    id;
    begin_date;
    end_date;
    planId;
    companyId;
    enabled;
    createdAt;
    createdById;
    constructor(id, begin_date, end_date, planId, companyId, enabled, createdAt, createdById) {
        this.id = id;
        this.begin_date = begin_date;
        this.end_date = end_date;
        this.planId = planId;
        this.companyId = companyId;
        this.enabled = enabled;
        this.createdAt = createdAt;
        this.createdById = createdById;
    }
}
exports.Subscriptions = Subscriptions;
//# sourceMappingURL=subscriptions.entity.js.map