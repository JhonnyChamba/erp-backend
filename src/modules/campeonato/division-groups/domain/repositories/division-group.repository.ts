import { DivisionGroup } from '../entities/division-group.entity';

/**
 * Contrato de repositorio para Grupos de División.
 */
export abstract class DivisionGroupRepository {
  abstract create(entity: DivisionGroup): Promise<DivisionGroup>;
  abstract findById(id: number, companyId: number): Promise<DivisionGroup | null>;
  abstract findByCompany(
    companyId: number,
    page?: number,
    limit?: number,
    search?: string,
  ): Promise<{ data: DivisionGroup[]; total: number }>;
  abstract update(entity: DivisionGroup): Promise<DivisionGroup>;
  abstract softDelete(id: number, companyId: number, user?: any): Promise<void>;
  abstract generateNextCode(companyId: number): Promise<string>;
}
