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
exports.EmployeeService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const employee_orm_entity_1 = require("../infrastructure/persistence/employee.orm-entity");
const users_orm_entity_1 = require("../../users/infrastructure/persistence/users.orm-entity");
const password_service_1 = require("../../../common/password/password.service");
let EmployeeService = class EmployeeService {
    employeeRepo;
    userRepo;
    passwordService;
    constructor(employeeRepo, userRepo, passwordService) {
        this.employeeRepo = employeeRepo;
        this.userRepo = userRepo;
        this.passwordService = passwordService;
    }
    async list(companyId, filters = {}) {
        const qb = this.employeeRepo
            .createQueryBuilder('e')
            .leftJoinAndSelect('e.category', 'cat')
            .leftJoinAndSelect('e.branch', 'br')
            .leftJoinAndSelect('e.user', 'u')
            .leftJoinAndSelect('u.role', 'urole')
            .where('e.company_id = :companyId AND e.deleted = false', { companyId })
            .orderBy('e.last_name', 'ASC')
            .addOrderBy('e.first_name', 'ASC');
        if (filters.branchId) {
            qb.andWhere('(e.branch_id = :branchId OR e.branch_id IS NULL)', { branchId: filters.branchId });
        }
        if (filters.categoryId) {
            qb.andWhere('e.category_id = :categoryId', { categoryId: filters.categoryId });
        }
        if (filters.acceptsAppointments !== undefined) {
            qb.andWhere('e.accepts_appointments = :accepts', { accepts: filters.acceptsAppointments });
        }
        if (filters.status) {
            qb.andWhere('e.status = :status', { status: filters.status });
        }
        if (filters.search) {
            const term = `%${filters.search.trim().toLowerCase()}%`;
            qb.andWhere('(LOWER(e.first_name) LIKE :term OR LOWER(e.last_name) LIKE :term OR e.id_number LIKE :term OR LOWER(cat.name) LIKE :term)', { term });
        }
        return qb.getMany();
    }
    async getById(id, companyId) {
        const employee = await this.employeeRepo.findOne({
            where: { id, company_id: companyId, deleted: false },
            relations: ['category', 'branch', 'user', 'user.role'],
        });
        if (!employee) {
            throw new common_1.NotFoundException(`Empleado con ID ${id} no encontrado.`);
        }
        return employee;
    }
    async create(companyId, dto) {
        let assignedUserId = dto.user_id || null;
        if (dto.create_user_account && dto.user_email && dto.user_password) {
            const cleanEmail = dto.user_email.trim().toLowerCase();
            const existing = await this.userRepo.findOne({
                where: { email: cleanEmail, deleted: false },
            });
            if (existing) {
                throw new common_1.BadRequestException(`Ya existe un usuario con el correo electrónico ${cleanEmail}.`);
            }
            const hashedPassword = await this.passwordService.hash(dto.user_password);
            const newUser = this.userRepo.create({
                company: { id: companyId },
                role: dto.user_role_id ? { id: dto.user_role_id } : undefined,
                num_document: dto.id_number,
                name_user: dto.first_name,
                last_name_user: dto.last_name,
                email: cleanEmail,
                password: hashedPassword,
                photo_url: dto.photo_url || '/controller/images/profile/user-1.jpg',
                theme_color: 'Blue_Theme',
                enabled: true,
                deleted: false,
            });
            const savedUser = await this.userRepo.save(newUser);
            assignedUserId = savedUser.id;
        }
        const entity = this.employeeRepo.create({
            ...dto,
            user_id: assignedUserId,
            company_id: companyId,
        });
        const saved = await this.employeeRepo.save(entity);
        return this.getById(saved.id, companyId);
    }
    async update(id, companyId, dto) {
        const employee = await this.getById(id, companyId);
        let assignedUserId = dto.user_id !== undefined ? dto.user_id : employee.user_id;
        if (dto.create_user_account && dto.user_email && dto.user_password) {
            const cleanEmail = dto.user_email.trim().toLowerCase();
            const existing = await this.userRepo.findOne({
                where: { email: cleanEmail, deleted: false },
            });
            if (existing && existing.id !== employee.user_id) {
                throw new common_1.BadRequestException(`Ya existe un usuario con el correo electrónico ${cleanEmail}.`);
            }
            if (employee.user_id) {
                const existingUser = await this.userRepo.findOne({ where: { id: employee.user_id } });
                if (existingUser) {
                    existingUser.email = cleanEmail;
                    if (dto.user_password.trim() !== '') {
                        existingUser.password = await this.passwordService.hash(dto.user_password);
                    }
                    if (dto.user_role_id) {
                        existingUser.role = { id: dto.user_role_id };
                    }
                    await this.userRepo.save(existingUser);
                }
            }
            else {
                const hashedPassword = await this.passwordService.hash(dto.user_password);
                const newUser = this.userRepo.create({
                    company: { id: companyId },
                    role: dto.user_role_id ? { id: dto.user_role_id } : undefined,
                    num_document: dto.id_number || employee.id_number,
                    name_user: dto.first_name || employee.first_name,
                    last_name_user: dto.last_name || employee.last_name,
                    email: cleanEmail,
                    password: hashedPassword,
                    photo_url: dto.photo_url || employee.photo_url || '/controller/images/profile/user-1.jpg',
                    theme_color: 'Blue_Theme',
                    enabled: true,
                    deleted: false,
                });
                const savedUser = await this.userRepo.save(newUser);
                assignedUserId = savedUser.id;
            }
        }
        Object.assign(employee, dto);
        employee.user_id = assignedUserId;
        await this.employeeRepo.save(employee);
        return this.getById(id, companyId);
    }
    async toggleStatus(id, companyId) {
        const employee = await this.getById(id, companyId);
        employee.status = employee.status === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
        return this.employeeRepo.save(employee);
    }
    async remove(id, companyId) {
        const employee = await this.getById(id, companyId);
        employee.deleted = true;
        await this.employeeRepo.save(employee);
    }
};
exports.EmployeeService = EmployeeService;
exports.EmployeeService = EmployeeService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(employee_orm_entity_1.EmployeeOrmEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(users_orm_entity_1.UsersOrmEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        password_service_1.PasswordService])
], EmployeeService);
//# sourceMappingURL=employee.service.js.map