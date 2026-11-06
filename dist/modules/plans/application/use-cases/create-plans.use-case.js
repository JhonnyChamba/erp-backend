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
exports.CreatePlansUseCase = void 0;
const plans_repository_1 = require("../../domain/repositories/plans.repository");
const plans_entity_1 = require("../../domain/entities/plans.entity");
const common_1 = require("@nestjs/common");
let CreatePlansUseCase = class CreatePlansUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(dto, user) {
        const company = new plans_entity_1.Plans(null, dto.price, dto.billing_cycle, dto.description, dto.max_users, dto.max_branches, true, user.user_name, user.user_id);
        return this.repository.create(company);
    }
};
exports.CreatePlansUseCase = CreatePlansUseCase;
exports.CreatePlansUseCase = CreatePlansUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [plans_repository_1.PlansRepository])
], CreatePlansUseCase);
//# sourceMappingURL=create-plans.use-case.js.map