import { Users } from "../entities/users.entity";
export declare abstract class UsersRepository {
    abstract create(branch: Users): Promise<Users>;
    abstract findByCompany(companyId?: number, page?: number, limit?: number): Promise<{
        data: Users[];
        total: number;
    }>;
    abstract findById(id: number, companyId?: number): Promise<Users | null>;
    abstract update(branch: Users): Promise<Users>;
    abstract findByEmail(email: string): Promise<Users | null>;
}
