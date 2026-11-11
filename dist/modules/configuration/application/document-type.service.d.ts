import { Repository } from 'typeorm';
import { DocumentTypeOrmEntity } from '../infrastructure/persistence/document-type.orm-entity';
import { CreateDocumentTypeDto, UpdateDocumentTypeDto } from './dto/document-type.dto';
export declare class DocumentTypeService {
    private readonly docTypeRepo;
    constructor(docTypeRepo: Repository<DocumentTypeOrmEntity>);
    private ensureDefaultDocumentTypes;
    list(companyId: number, typeFilter?: string, onlyActive?: boolean): Promise<DocumentTypeOrmEntity[]>;
    get(id: number, companyId: number): Promise<DocumentTypeOrmEntity>;
    create(companyId: number, dto: CreateDocumentTypeDto): Promise<DocumentTypeOrmEntity>;
    update(id: number, companyId: number, dto: UpdateDocumentTypeDto): Promise<DocumentTypeOrmEntity>;
    toggleStatus(id: number, companyId: number): Promise<DocumentTypeOrmEntity>;
    remove(id: number, companyId: number): Promise<{
        success: boolean;
        message: string;
    }>;
}
