import { EmployeeCategoryService } from '../application/employee-category.service';
import { CreateEmployeeCategoryDto, UpdateEmployeeCategoryDto } from '../application/dto/employee-category.dto';
export declare class EmployeeCategoryController {
    private readonly categoryService;
    constructor(categoryService: EmployeeCategoryService);
    private resolveCompanyId;
    list(companyIdQuery: string, activeQuery: string, req: any): Promise<import("../infrastructure/persistence/employee-category.orm-entity").EmployeeCategoryOrmEntity[]>;
    getById(id: number, companyIdQuery: string, req: any): Promise<import("../infrastructure/persistence/employee-category.orm-entity").EmployeeCategoryOrmEntity>;
    create(dto: CreateEmployeeCategoryDto, companyIdQuery: string, req: any): Promise<import("../infrastructure/persistence/employee-category.orm-entity").EmployeeCategoryOrmEntity>;
    update(id: number, dto: UpdateEmployeeCategoryDto, companyIdQuery: string, req: any): Promise<import("../infrastructure/persistence/employee-category.orm-entity").EmployeeCategoryOrmEntity>;
    toggleStatus(id: number, companyIdQuery: string, req: any): Promise<import("../infrastructure/persistence/employee-category.orm-entity").EmployeeCategoryOrmEntity>;
    remove(id: number, companyIdQuery: string, req: any): Promise<void>;
}
