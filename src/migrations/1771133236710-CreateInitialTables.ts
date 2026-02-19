import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateInitialTables1771133236710 implements MigrationInterface {
    name = 'CreateInitialTables1771133236710'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "tab_roles" ("id" SERIAL NOT NULL, "description" character varying NOT NULL, "enabled" boolean NOT NULL DEFAULT true, "deleted" boolean NOT NULL DEFAULT false, "created_user" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" integer, CONSTRAINT "PK_d6bfbe213fdf5db0b886832f898" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tab_company" ("id" SERIAL NOT NULL, "ruc" character varying NOT NULL, "description" character varying NOT NULL, "business_name" character varying NOT NULL, "trade_name" character varying NOT NULL, "enabled" boolean NOT NULL DEFAULT true, "deleted" boolean NOT NULL DEFAULT false, "created_user" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" integer, CONSTRAINT "PK_fab6eeba44aba7f6a78a605bbe5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tab_users_company" ("id" SERIAL NOT NULL, "enabled" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" integer, "company_id" integer, CONSTRAINT "PK_b4acd985e73de7fa362edf08a20" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "tab_roles" ADD CONSTRAINT "FK_cd4798df92370e2bcc699829d1a" FOREIGN KEY ("user_id") REFERENCES "tab_users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tab_company" ADD CONSTRAINT "FK_bb7d697f749001d58dcd8fb950a" FOREIGN KEY ("user_id") REFERENCES "tab_users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tab_users_company" ADD CONSTRAINT "FK_a1a899caa9d9e023f09e2e4d942" FOREIGN KEY ("user_id") REFERENCES "tab_users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tab_users_company" ADD CONSTRAINT "FK_64dcf964b7d7d9d1dbf9656be95" FOREIGN KEY ("company_id") REFERENCES "tab_company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tab_users_company" DROP CONSTRAINT "FK_64dcf964b7d7d9d1dbf9656be95"`);
        await queryRunner.query(`ALTER TABLE "tab_users_company" DROP CONSTRAINT "FK_a1a899caa9d9e023f09e2e4d942"`);
        await queryRunner.query(`ALTER TABLE "tab_company" DROP CONSTRAINT "FK_bb7d697f749001d58dcd8fb950a"`);
        await queryRunner.query(`ALTER TABLE "tab_roles" DROP CONSTRAINT "FK_cd4798df92370e2bcc699829d1a"`);
        await queryRunner.query(`DROP TABLE "tab_users_company"`);
        await queryRunner.query(`DROP TABLE "tab_company"`);
        await queryRunner.query(`DROP TABLE "tab_roles"`);
    }

}
