import { PermissionsTemplates } from "../entities/permissions-templates.entity";

export abstract class PermissionsTemplatesRepository {
  abstract create(branch: PermissionsTemplates): Promise<PermissionsTemplates>;
  abstract findByCompany(page: number, limit: number): Promise<{
    data: PermissionsTemplates[];
    total: number;
  }>;
  abstract findById(id: number): Promise<PermissionsTemplates | null>;
  abstract update(branch: PermissionsTemplates): Promise<PermissionsTemplates>;
}