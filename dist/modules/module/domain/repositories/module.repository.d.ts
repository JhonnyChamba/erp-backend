import { Module } from "../entities/module.entity";
export declare abstract class ModuleRepository {
    abstract create(branch: Module): Promise<Module>;
    abstract findByCompany(page: number, limit: number): Promise<{
        data: Module[];
        total: number;
    }>;
    abstract findById(id: number): Promise<Module | null>;
    abstract update(branch: Module): Promise<Module>;
}
