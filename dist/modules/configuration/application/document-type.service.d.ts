import { Repository } from 'typeorm';
import { DocumentTypeOrmEntity } from '../infrastructure/persistence/document-type.orm-entity';
import { CreateDocumentTypeDto, UpdateDocumentTypeDto } from './dto/document-type.dto';
export declare class DocumentTypeService {
    private readonly docTypeRepo;
    constructor(docTypeRepo: Repository<DocumentTypeOrmEntity>);
    private ensureDefaultDocumentTypes;
    list(typeFilter?: string, onlyActive?: boolean): Promise<DocumentTypeOrmEntity[]>;
    get(id: number): Promise<DocumentTypeOrmEntity>;
    create(dto: CreateDocumentTypeDto): Promise<DocumentTypeOrmEntity>;
    update(id: number, dto: UpdateDocumentTypeDto): Promise<DocumentTypeOrmEntity>;
    toggleStatus(id: number): Promise<DocumentTypeOrmEntity>;
    remove(id: number): Promise<{
        success: boolean;
        message: string;
    }>;
}
