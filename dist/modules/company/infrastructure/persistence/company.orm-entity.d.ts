import { UsersOrmEntity } from 'src/modules/users/infrastructure/persistence/users.orm-entity';
export declare class CompanyOrmEntity {
    id: number;
    ruc: string;
    description: string;
    business_name: string;
    trade_name: string;
    enabled: boolean;
    deleted: boolean;
    createdBy: UsersOrmEntity;
    created_name: string;
    createdAt: Date;
    updatedBy: UsersOrmEntity;
    update_name: string;
    updatedAt: Date;
    deletedBy: UsersOrmEntity;
    deleted_name: string;
    deletedAt?: Date;
}
