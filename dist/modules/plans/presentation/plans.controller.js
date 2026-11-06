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
exports.PlansController = void 0;
const create_plans_use_case_1 = require("../application/use-cases/create-plans.use-case");
const update_plans_use_case_1 = require("../application/use-cases/update-plans.use-case");
const common_1 = require("@nestjs/common");
const list_plans_use_case_1 = require("../application/use-cases/list-plans.use-case");
const get_plans_use_case_1 = require("../application/use-cases/get-plans.use-case");
const create_plans_dto_1 = require("../application/dto/create-plans.dto");
const update_plans_dto_1 = require("../application/dto/update-plans.dto");
const list_plans_dto_1 = require("../application/dto/list-plans.dto");
const passport_1 = require("@nestjs/passport");
let PlansController = class PlansController {
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
        return this.getUseCase.execute(Number(id));
    }
    update(id, dto, req) {
        return this.updateUseCase.execute(Number(id), dto);
    }
};
exports.PlansController = PlansController;
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_plans_dto_1.CreatePlansDto, Object]),
    __metadata("design:returntype", void 0)
], PlansController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_plans_dto_1.ListPlansDto, Object]),
    __metadata("design:returntype", void 0)
], PlansController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], PlansController.prototype, "get", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_plans_dto_1.UpdatePlansDto, Object]),
    __metadata("design:returntype", void 0)
], PlansController.prototype, "update", null);
exports.PlansController = PlansController = __decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('plans'),
    __metadata("design:paramtypes", [create_plans_use_case_1.CreatePlansUseCase,
        list_plans_use_case_1.ListPlansUseCase,
        get_plans_use_case_1.GetPlansUseCase,
        update_plans_use_case_1.UpdatePlansUseCase])
], PlansController);
//# sourceMappingURL=plans.controller.js.map