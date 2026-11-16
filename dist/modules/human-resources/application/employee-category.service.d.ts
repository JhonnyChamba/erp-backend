import { Repository } from 'typeorm';
import { EmployeeCategoryOrmEntity } from '../infrastructure/persistence/employee-category.orm-entity';
import { CreateEmployeeCategoryDto, UpdateEmployeeCategoryDto } from './dto/employee-category.dto';
export declare class EmployeeCategoryService {
    private readonly categoryRepo;
    constructor(categoryRepo: Repository<EmployeeCategoryOrmEntity>);
    list(companyId: number, activeOnly?: boolean): Promise<EmployeeCategoryOrmEntity[]>;
    getById(id: number, companyId: number): Promise<EmployeeCategoryOrmEntity>;
    create(companyId: number, dto: CreateEmployeeCategoryDto): Promise<EmployeeCategoryOrmEntity>;
    update(id: number, companyId: number, dto: UpdateEmployeeCategoryDto): Promise<EmployeeCategoryOrmEntity>;
    toggleStatus(id: number, companyId: number): Promise<EmployeeCategoryOrmEntity>;
    remove(id: number, companyId: number): Promise<void>;
}
