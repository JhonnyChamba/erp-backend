import { EmployeeService } from '../application/employee.service';
import { CreateEmployeeDto, UpdateEmployeeDto } from './../application/dto/employee.dto';
export declare class EmployeeController {
    private readonly employeeService;
    constructor(employeeService: EmployeeService);
    private resolveCompanyId;
    list(companyIdQuery: string, branchIdQuery: string, categoryIdQuery: string, acceptsAppointmentsQuery: string, statusQuery: string, searchQuery: string, req: any): Promise<import("../infrastructure/persistence/employee.orm-entity").EmployeeOrmEntity[]>;
    getById(id: number, companyIdQuery: string, req: any): Promise<import("../infrastructure/persistence/employee.orm-entity").EmployeeOrmEntity>;
    create(dto: CreateEmployeeDto, companyIdQuery: string, req: any): Promise<import("../infrastructure/persistence/employee.orm-entity").EmployeeOrmEntity>;
    update(id: number, dto: UpdateEmployeeDto, companyIdQuery: string, req: any): Promise<import("../infrastructure/persistence/employee.orm-entity").EmployeeOrmEntity>;
    toggleStatus(id: number, companyIdQuery: string, req: any): Promise<import("../infrastructure/persistence/employee.orm-entity").EmployeeOrmEntity>;
    remove(id: number, companyIdQuery: string, req: any): Promise<void>;
}
