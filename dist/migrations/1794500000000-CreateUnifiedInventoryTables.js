"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUnifiedInventoryTables1794500000000 = void 0;
class CreateUnifiedInventoryTables1794500000000 {
    name = 'CreateUnifiedInventoryTables1794500000000';
    async up(queryRunner) {
        await queryRunner.query(`
			ALTER TABLE "tab_inventory_category" 
			ADD COLUMN IF NOT EXISTS "category_type" character varying(20) NOT NULL DEFAULT 'ALL',
			ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
		`);
        await queryRunner.query(`
			ALTER TABLE "tab_inventory_warehouse" 
			ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
		`);
        await queryRunner.query(`
			CREATE TABLE IF NOT EXISTS "tab_items" (
				"id" SERIAL PRIMARY KEY,
				"company_id" integer NOT NULL,
				"product_category_id" integer,
				"category_name" character varying(150),
				"code" character varying(100) NOT NULL,
				"sku" character varying(100),
				"name" character varying(250) NOT NULL,
				"description" text,
				"item_type" character varying(20) NOT NULL DEFAULT 'PRODUCT',
				"unit_measure" character varying(50) NOT NULL DEFAULT 'UND',
				"sale_price" numeric(18,6) NOT NULL DEFAULT 0,
				"purchase_price" numeric(18,6) NOT NULL DEFAULT 0,
				"tax_rate" numeric(5,2) NOT NULL DEFAULT 15,
				"ind_active" boolean NOT NULL DEFAULT true,
				"deleted" boolean NOT NULL DEFAULT false,
				"created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
				"updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
				CONSTRAINT "FK_tab_items_company" FOREIGN KEY ("company_id") REFERENCES "tab_company"("id") ON DELETE CASCADE,
				CONSTRAINT "FK_tab_items_category" FOREIGN KEY ("product_category_id") REFERENCES "tab_inventory_category"("id") ON DELETE SET NULL
			);
		`);
        await queryRunner.query(`
			CREATE INDEX IF NOT EXISTS "IDX_tab_items_company_code" ON "tab_items" ("company_id", "code");
			CREATE INDEX IF NOT EXISTS "IDX_tab_items_company_type" ON "tab_items" ("company_id", "item_type");
		`);
        await queryRunner.query(`
			CREATE TABLE IF NOT EXISTS "tab_inventory_balances" (
				"id" SERIAL PRIMARY KEY,
				"company_id" integer NOT NULL,
				"warehouse_id" integer NOT NULL,
				"product_id" integer NOT NULL,
				"stock" numeric(18,6) NOT NULL DEFAULT 0,
				"reserved_stock" numeric(18,6) NOT NULL DEFAULT 0,
				"average_cost" numeric(18,6) NOT NULL DEFAULT 0,
				"created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
				"updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
				CONSTRAINT "UQ_inventory_balances_company_wh_prod" UNIQUE ("company_id", "warehouse_id", "product_id"),
				CONSTRAINT "FK_inventory_balances_company" FOREIGN KEY ("company_id") REFERENCES "tab_company"("id") ON DELETE CASCADE,
				CONSTRAINT "FK_inventory_balances_warehouse" FOREIGN KEY ("warehouse_id") REFERENCES "tab_inventory_warehouse"("id") ON DELETE RESTRICT,
				CONSTRAINT "FK_inventory_balances_product" FOREIGN KEY ("product_id") REFERENCES "tab_items"("id") ON DELETE RESTRICT
			);
		`);
        await queryRunner.query(`
			CREATE TABLE IF NOT EXISTS "tab_inventory_movements" (
				"id" SERIAL PRIMARY KEY,
				"company_id" integer NOT NULL,
				"warehouse_id" integer NOT NULL,
				"product_id" integer NOT NULL,
				"product_code" character varying(100) NOT NULL,
				"product_name" character varying(250) NOT NULL,
				"movement_type" character varying(10) NOT NULL,
				"movement_reason" character varying(30) NOT NULL,
				"quantity" numeric(18,6) NOT NULL,
				"unit_cost" numeric(18,6) NOT NULL DEFAULT 0,
				"total_cost" numeric(18,6) NOT NULL DEFAULT 0,
				"stock_after" numeric(18,6) NOT NULL,
				"collection_origin_id" character varying(100),
				"collection_origin_name" character varying(100),
				"collection_origin_document" character varying(100),
				"movement_group_id" character varying(100),
				"idempotency_key" character varying(150),
				"reversal_of_movement_id" integer,
				"movement_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
				"created_user_id" integer,
				"created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
				CONSTRAINT "FK_inventory_movements_company" FOREIGN KEY ("company_id") REFERENCES "tab_company"("id") ON DELETE CASCADE,
				CONSTRAINT "FK_inventory_movements_warehouse" FOREIGN KEY ("warehouse_id") REFERENCES "tab_inventory_warehouse"("id") ON DELETE RESTRICT,
				CONSTRAINT "FK_inventory_movements_product" FOREIGN KEY ("product_id") REFERENCES "tab_items"("id") ON DELETE RESTRICT
			);
		`);
        await queryRunner.query(`
			CREATE INDEX IF NOT EXISTS "IDX_inventory_movements_company_prod" ON "tab_inventory_movements" ("company_id", "product_id");
			CREATE INDEX IF NOT EXISTS "IDX_inventory_movements_company_wh" ON "tab_inventory_movements" ("company_id", "warehouse_id");
			CREATE INDEX IF NOT EXISTS "IDX_inventory_movements_idempotency" ON "tab_inventory_movements" ("idempotency_key");
			CREATE INDEX IF NOT EXISTS "IDX_inventory_movements_group" ON "tab_inventory_movements" ("movement_group_id");
		`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE IF EXISTS "tab_inventory_movements"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "tab_inventory_balances"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "tab_items"`);
        await queryRunner.query(`ALTER TABLE "tab_inventory_warehouse" DROP COLUMN IF EXISTS "updated_at"`);
        await queryRunner.query(`
			ALTER TABLE "tab_inventory_category" 
			DROP COLUMN IF EXISTS "updated_at",
			DROP COLUMN IF EXISTS "category_type"
		`);
    }
}
exports.CreateUnifiedInventoryTables1794500000000 = CreateUnifiedInventoryTables1794500000000;
//# sourceMappingURL=1794500000000-CreateUnifiedInventoryTables.js.map