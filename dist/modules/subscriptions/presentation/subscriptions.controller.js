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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionsController = void 0;
const create_subscriptions_use_case_1 = require("../application/use-cases/create-subscriptions.use-case");
const update_subscriptions_use_case_1 = require("../application/use-cases/update-subscriptions.use-case");
const common_1 = require("@nestjs/common");
const list_subscriptions_use_case_1 = require("../application/use-cases/list-subscriptions.use-case");
const get_subscriptions_use_case_1 = require("../application/use-cases/get-subscriptions.use-case");
const create_subscriptions_dto_1 = require("../application/dto/create-subscriptions.dto");
const update_subscriptions_dto_1 = require("../application/dto/update-subscriptions.dto");
const list_subscriptions_dto_1 = require("../application/dto/list-subscriptions.dto");
const passport_1 = require("@nestjs/passport");
let SubscriptionsController = class SubscriptionsController {
    createUseCase;
    listUseCase;
    getUseCase;
    updateUseCase;
    constructor(createUseCase, listUseCase, getUseCase, updateUseCase) {
        this.createUseCase = createUseCase;
        this.listUseCase = listUseCase;
        this.getUseCase = getUseCase;
        this.updateUseCase = updateUseCase;
    }
    create(dto, req) {
        return this.createUseCase.execute(dto, req.user);
    }
    list(query, req) {
        return this.listUseCase.execute(query, req.user);
    }
    get(id, req) {
        return this.getUseCase.execute(Number(id), req.companyId);
    }
    update(id, dto, req) {
        return this.updateUseCase.execute(Number(id), req.companyId, dto);
    }
};
exports.SubscriptionsController = SubscriptionsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_subscriptions_dto_1.CreateSubscriptionsDto, Object]),
    __metadata("design:returntype", void 0)
], SubscriptionsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_subscriptions_dto_1.ListSubscriptionsDto, Object]),
    __metadata("design:returntype", void 0)
], SubscriptionsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], SubscriptionsController.prototype, "get", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_subscriptions_dto_1.UpdateSubscriptionsDto, Object]),
    __metadata("design:returntype", void 0)
], SubscriptionsController.prototype, "update", null);
exports.SubscriptionsController = SubscriptionsController = __decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('subscriptions'),
    __metadata("design:paramtypes", [create_subscriptions_use_case_1.CreateSubscriptionsUseCase,
        list_subscriptions_use_case_1.ListSubscriptionsUseCase,
        get_subscriptions_use_case_1.GetSubscriptionsUseCase,
        update_subscriptions_use_case_1.UpdateSubscriptionsUseCase])
], SubscriptionsController);
//# sourceMappingURL=subscriptions.controller.js.map