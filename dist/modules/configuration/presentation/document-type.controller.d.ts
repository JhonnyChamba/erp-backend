import { DocumentTypeService } from '../application/document-type.service';
import { CreateDocumentTypeDto, UpdateDocumentTypeDto } from '../application/dto/document-type.dto';
export declare class DocumentTypeController {
    private readonly docTypeService;
    constructor(docTypeService: DocumentTypeService);
    private resolveCompanyId;
    list(companyIdQuery: string, typeQuery: string, activeQuery: string, req: any): Promise<import("../infrastructure/persistence/document-type.orm-entity").DocumentTypeOrmEntity[]>;
    get(id: number, req: any): Promise<import("../infrastructure/persistence/document-type.orm-entity").DocumentTypeOrmEntity>;
    create(dto: CreateDocumentTypeDto, req: any): Promise<import("../infrastructure/persistence/document-type.orm-entity").DocumentTypeOrmEntity>;
    update(id: number, dto: UpdateDocumentTypeDto, req: any): Promise<import("../infrastructure/persistence/document-type.orm-entity").DocumentTypeOrmEntity>;
    toggleStatus(id: number, req: any): Promise<import("../infrastructure/persistence/document-type.orm-entity").DocumentTypeOrmEntity>;
    remove(id: number, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
