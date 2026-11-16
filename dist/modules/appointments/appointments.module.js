"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const appointment_orm_entity_1 = require("./infrastructure/persistence/appointment.orm-entity");
const appointment_item_orm_entity_1 = require("./infrastructure/persistence/appointment-item.orm-entity");
const employee_schedule_orm_entity_1 = require("./infrastructure/persistence/employee-schedule.orm-entity");
const employee_orm_entity_1 = require("../human-resources/infrastructure/persistence/employee.orm-entity");
const contacts_orm_entity_1 = require("../contacts/infrastructure/persistence/contacts.orm-entity");
const appointments_service_1 = require("./application/appointments.service");
const appointments_controller_1 = require("./presentation/appointments.controller");
let AppointmentsModule = class AppointmentsModule {
};
exports.AppointmentsModule = AppointmentsModule;
exports.AppointmentsModule = AppointmentsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                appointment_orm_entity_1.AppointmentOrmEntity,
                appointment_item_orm_entity_1.AppointmentItemOrmEntity,
                employee_schedule_orm_entity_1.EmployeeScheduleOrmEntity,
                employee_orm_entity_1.EmployeeOrmEntity,
                contacts_orm_entity_1.CustomerOrmEntity,
            ]),
        ],
        controllers: [appointments_controller_1.AppointmentsController],
        providers: [appointments_service_1.AppointmentsService],
        exports: [appointments_service_1.AppointmentsService],
    })
], AppointmentsModule);
//# sourceMappingURL=appointments.module.js.map