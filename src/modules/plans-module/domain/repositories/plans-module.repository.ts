import { PlansModules } from "../entities/plans-module.entity";

export abstract class PlansModulesRepository {
  abstract create(subModule: PlansModules): Promise<PlansModules>;

  abstract findByCompany(planId: number, page: number, limit: number): Promise<{
    data: PlansModules[];
    total: number;
  }>;

  abstract findById(id: number, planId: number): Promise<PlansModules | null>;
  
  abstract update(subModule: PlansModules): Promise<PlansModules>;
}