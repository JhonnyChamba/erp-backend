import { CompanyOrmEntity } from 'src/modules/company/infrastructure/persistence/company.orm-entity';
export declare abstract class ContactBaseOrmEntity {
    id: number;
    company_id: number;
    company: CompanyOrmEntity;
    tipo_documento: string;
    num_document: string;
    email: string;
    telefono: string;
    direccion: string;
    estado: string;
    deleted: boolean;
    created_by: number;
    created_at: Date;
    updated_at: Date;
}
export declare class CustomerOrmEntity extends ContactBaseOrmEntity {
    razon_social: string;
    nombre_comercial: string;
    ciudad: string;
}
export declare class ProviderOrmEntity extends ContactBaseOrmEntity {
    razon_social: string;
    nombre_comercial: string;
    forma_pago: string;
    banco: string;
    num_cuenta: string;
}
export declare class SellerOrmEntity extends ContactBaseOrmEntity {
    nombres: string;
    apellidos: string;
    comision_pct: number;
}
