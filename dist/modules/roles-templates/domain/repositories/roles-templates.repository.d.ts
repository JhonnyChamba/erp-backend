import { RolesTemplates } from "../entities/roles-templates.entity";
export declare abstract class RolesTemplatesRepository {
    abstract create(branch: RolesTemplates): Promise<RolesTemplates>;
    abstract findByCompany(page: number, limit: number): Promise<{
        data: RolesTemplates[];
        total: number;
    }>;
    abstract findById(id: number): Promise<RolesTemplates | null>;
    abstract update(branch: RolesTemplates): Promise<RolesTemplates>;
}
