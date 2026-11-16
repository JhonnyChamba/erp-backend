import { subModules } from "../entities/sub-module.entity";
export declare abstract class subModulesRepository {
    abstract create(subModule: subModules): Promise<subModules>;
    abstract findByCompany(moduleId: number, page: number, limit: number): Promise<{
        data: subModules[];
        total: number;
    }>;
    abstract findById(id: number, moduleId: number): Promise<subModules | null>;
    abstract update(subModule: subModules): Promise<subModules>;
}
