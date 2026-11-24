import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Garantía por categoría de la edición (tab_campeonato_edition_category_details.guarantee_fee), que se cobra junto con
 * la inscripción en la orden de pago del equipo. Idempotente y sin borrar datos.
 * Mismo contenido que scripts/add-category-guarantee-fee.sql.
 */
export class AddCategoryGuaranteeFee1795600000000 implements MigrationInterface {
  name = 'AddCategoryGuaranteeFee1795600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE public.tab_campeonato_edition_category_details ADD COLUMN IF NOT EXISTS guarantee_fee numeric(10,2) NOT NULL DEFAULT 0`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE public.tab_campeonato_edition_category_details DROP COLUMN IF EXISTS guarantee_fee`);
  }
}
