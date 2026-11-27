/**
 * Entidad de dominio pura para Grupos de División (sin dependencias de TypeORM).
 */
export class DivisionGroup {
  constructor(
    public readonly id: number | null,
    public companyId: number,
    public code: string,
    public description: string,
    public enabled: boolean = true,
    public deleted: boolean = false,
    public createdBy?: string | null,
    public createdName?: string | null,
    public readonly createdAt?: Date,
    public updatedBy?: string | null,
    public updateName?: string | null,
    public readonly updatedAt?: Date,
  ) {}
}
