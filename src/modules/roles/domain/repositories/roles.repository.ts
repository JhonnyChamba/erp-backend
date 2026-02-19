import { Roles } from "../entities/roles.entity";

export abstract class RolesRepository {
  abstract create(branch: Roles): Promise<Roles>;
  abstract findByCompany(companyId: number, page: number, limit: number): Promise<{
    data: Roles[];
    total: number;
  }>;
  abstract findById(id: number, companyId: number): Promise<Roles | null>;
  abstract update(branch: Roles): Promise<Roles>;
}