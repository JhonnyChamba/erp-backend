import { Plans } from "../entities/plans.entity";

export abstract class PlansRepository {
  abstract create(company: Plans): Promise<Plans>;

  abstract findByPlans(page: number, limit: number): Promise<{
    data: Plans[];
    total: number;
  }>;

  abstract findById(id: number): Promise<Plans | null>;
  
  abstract update(company: Plans): Promise<Plans>;
}