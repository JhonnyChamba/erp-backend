import { StorageService } from './storage.service';
export declare class StorageController {
    private readonly storageService;
    constructor(storageService: StorageService);
    uploadCompanyLogo(companyId: number, file: any): Promise<{
        url: string;
    }>;
    uploadBranchLogo(branchId: number, companyIdQuery: string, req: any, file: any): Promise<{
        url: string;
    }>;
    uploadUserPhoto(userId: number, file: any): Promise<{
        url: string;
    }>;
    serveLocalFile(req: any, res: any): Promise<void>;
}
