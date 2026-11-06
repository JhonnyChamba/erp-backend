"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateSubscriptionsUseCase = void 0;
const subscriptions_repository_1 = require("../../domain/repositories/subscriptions.repository");
const subscriptions_entity_1 = require("../../domain/entities/subscriptions.entity");
const common_1 = require("@nestjs/common");
let CreateSubscriptionsUseCase = class CreateSubscriptionsUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(dto, user) {
        const subscriptions = new subscriptions_entity_1.Subscriptions(null, dto.begin_date, dto.end_date, dto.planId, dto.companyId, true, undefined, user.user_id);
        return this.repository.create(subscriptions);
    }
};
exports.CreateSubscriptionsUseCase = CreateSubscriptionsUseCase;
exports.CreateSubscriptionsUseCase = CreateSubscriptionsUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [subscriptions_repository_1.SubscriptionsRepository])
], CreateSubscriptionsUseCase);
//# sourceMappingURL=create-subscriptions.use-case.js.map