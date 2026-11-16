import { DocumentTypeService } from '../application/document-type.service';
import { CreateDocumentTypeDto, UpdateDocumentTypeDto } from '../application/dto/document-type.dto';
export declare class DocumentTypeController {
    private readonly docTypeService;
    constructor(docTypeService: DocumentTypeService);
    list(typeQuery: string, activeQuery: string): Promise<import("../infrastructure/persistence/document-type.orm-entity").DocumentTypeOrmEntity[]>;
    get(id: number): Promise<import("../infrastructure/persistence/document-type.orm-entity").DocumentTypeOrmEntity>;
    create(dto: CreateDocumentTypeDto): Promise<import("../infrastructure/persistence/document-type.orm-entity").DocumentTypeOrmEntity>;
    update(id: number, dto: UpdateDocumentTypeDto): Promise<import("../infrastructure/persistence/document-type.orm-entity").DocumentTypeOrmEntity>;
    toggleStatus(id: number): Promise<import("../infrastructure/persistence/document-type.orm-entity").DocumentTypeOrmEntity>;
    remove(id: number): Promise<{
        success: boolean;
        message: string;
    }>;
}
