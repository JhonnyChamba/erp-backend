import { CompanyOrmEntity } from 'src/modules/company/infrastructure/persistence/company.orm-entity';
import { EmployeeOrmEntity } from 'src/modules/human-resources/infrastructure/persistence/employee.orm-entity';
export declare class EmployeeScheduleOrmEntity {
    id: number;
    company_id: number;
    company: CompanyOrmEntity;
    employee_id: number;
    employee: EmployeeOrmEntity;
    day_of_week: number;
    start_time: string;
    end_time: string;
    break_start: string | null;
    break_end: string | null;
    active: boolean;
    created_at: Date;
    updated_at: Date;
}
