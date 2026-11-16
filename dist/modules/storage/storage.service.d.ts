import { Repository } from 'typeorm';
import { CompanyOrmEntity } from '../company/infrastructure/persistence/company.orm-entity';
import { BranchCompanyOrmEntity } from '../branch-company/infrastructure/persistence/branch-company.orm-entity';
import { UsersOrmEntity } from '../users/infrastructure/persistence/users.orm-entity';
export declare class StorageService {
    private readonly companyRepo;
    private readonly branchRepo;
    private readonly usersRepo;
    private readonly logger;
    private readonly supabaseUrl;
    private readonly supabaseKey;
    private readonly bucketName;
    private readonly localUploadsRoot;
    constructor(companyRepo: Repository<CompanyOrmEntity>, branchRepo: Repository<BranchCompanyOrmEntity>, usersRepo: Repository<UsersOrmEntity>);
    private validateImage;
    private getExtension;
    uploadRaw(file: any, storagePath: string): Promise<string>;
    uploadCompanyLogo(companyId: number, file: any): Promise<{
        url: string;
    }>;
    uploadBranchLogo(branchId: number, companyId: number, file: any): Promise<{
        url: string;
    }>;
    uploadUserPhoto(userId: number, file: any): Promise<{
        url: string;
    }>;
    getLocalFilePath(subPath: string): string | null;
}
