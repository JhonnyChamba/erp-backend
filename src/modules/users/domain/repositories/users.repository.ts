import { Users } from "../entities/users.entity";

export abstract class UsersRepository {
  abstract create(branch: Users): Promise<Users>;
  abstract findByCompany(companyId?: number, page?: number, limit?: number): Promise<{
    data: Users[];
    total: number;
  }>;
  /** Con `companyId` solo devuelve usuarios de esa empresa, salvo `anyCompany` (reservado a super admin). */
  abstract findById(id: number, companyId?: number, anyCompany?: boolean): Promise<Users | null>;
  abstract update(branch: Users): Promise<Users>;
  abstract findByEmail(email: string): Promise<Users | null>
}