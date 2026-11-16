"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HumanResourcesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const employee_category_orm_entity_1 = require("./infrastructure/persistence/employee-category.orm-entity");
const employee_orm_entity_1 = require("./infrastructure/persistence/employee.orm-entity");
const users_orm_entity_1 = require("../users/infrastructure/persistence/users.orm-entity");
const password_module_1 = require("../../common/password/password.module");
const employee_category_service_1 = require("./application/employee-category.service");
const employee_service_1 = require("./application/employee.service");
const employee_category_controller_1 = require("./presentation/employee-category.controller");
const employee_controller_1 = require("./presentation/employee.controller");
let HumanResourcesModule = class HumanResourcesModule {
};
exports.HumanResourcesModule = HumanResourcesModule;
exports.HumanResourcesModule = HumanResourcesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                employee_category_orm_entity_1.EmployeeCategoryOrmEntity,
                employee_orm_entity_1.EmployeeOrmEntity,
                users_orm_entity_1.UsersOrmEntity,
            ]),
            password_module_1.PasswordModule,
        ],
        controllers: [
            employee_category_controller_1.EmployeeCategoryController,
            employee_controller_1.EmployeeController,
        ],
        providers: [
            employee_category_service_1.EmployeeCategoryService,
            employee_service_1.EmployeeService,
        ],
        exports: [
            employee_category_service_1.EmployeeCategoryService,
            employee_service_1.EmployeeService,
        ],
    })
], HumanResourcesModule);
//# sourceMappingURL=human-resources.module.js.map