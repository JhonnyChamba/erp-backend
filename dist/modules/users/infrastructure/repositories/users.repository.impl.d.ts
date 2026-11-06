import { UsersRepository } from '../../domain/repositories/users.repository';
import { PasswordService } from 'src/common/password/password.service';
import { UsersOrmEntity } from '../persistence/users.orm-entity';
import { UserCompanyOrmEntity } from 'src/modules/user-company/infrastructure/persistence/user-company.orm-entity';
import { Users } from '../../domain/entities/users.entity';
import { Repository } from 'typeorm';
export declare class UsersRepositoryImpl implements UsersRepository {
    private readonly repo;
    private readonly userCompanyRepo;
    private readonly passwordService;
    constructor(repo: Repository<UsersOrmEntity>, userCompanyRepo: Repository<UserCompanyOrmEntity>, passwordService: PasswordService);
    create(user: Users): Promise<Users>;
    findByCompany(companyId: number, page: number, limit: number): Promise<{
        data: Users[];
        total: number;
    }>;
    findById(id: number, companyId?: number): Promise<Users | null>;
    update(user: Users): Promise<Users>;
    findByEmail(email: string): Promise<Users | null>;
    private syncUserCompanies;
    private toDomain;
}
