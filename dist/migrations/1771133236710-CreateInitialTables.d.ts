import { MigrationInterface, QueryRunner } from "typeorm";
export declare class CreateInitialTables1771133236710 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
