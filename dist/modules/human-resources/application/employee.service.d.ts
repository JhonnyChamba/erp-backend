import { Repository } from 'typeorm';
import { EmployeeOrmEntity } from '../infrastructure/persistence/employee.orm-entity';
import { UsersOrmEntity } from 'src/modules/users/infrastructure/persistence/users.orm-entity';
import { PasswordService } from 'src/common/password/password.service';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto/employee.dto';
export declare class EmployeeService {
    private readonly employeeRepo;
    private readonly userRepo;
    private readonly passwordService;
    constructor(employeeRepo: Repository<EmployeeOrmEntity>, userRepo: Repository<UsersOrmEntity>, passwordService: PasswordService);
    list(companyId: number, filters?: {
        branchId?: number;
        categoryId?: number;
        acceptsAppointments?: boolean;
        status?: string;
        search?: string;
    }): Promise<EmployeeOrmEntity[]>;
    getById(id: number, companyId: number): Promise<EmployeeOrmEntity>;
    create(companyId: number, dto: CreateEmployeeDto): Promise<EmployeeOrmEntity>;
    update(id: number, companyId: number, dto: UpdateEmployeeDto): Promise<EmployeeOrmEntity>;
    toggleStatus(id: number, companyId: number): Promise<EmployeeOrmEntity>;
    remove(id: number, companyId: number): Promise<void>;
}
