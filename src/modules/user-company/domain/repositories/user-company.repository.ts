import { UserCompany } from "../entities/user-company.entity";

export abstract class UserCompanyRepository {
  abstract create(branch: UserCompany): Promise<UserCompany>;
  abstract findByCompany(usersId: number, page: number, limit: number): Promise<{
    data: UserCompany[];
    total: number;
  }>;
  abstract findById(id: number, usersId: number): Promise<UserCompany | null>;
  abstract update(branch: UserCompany): Promise<UserCompany>;
}