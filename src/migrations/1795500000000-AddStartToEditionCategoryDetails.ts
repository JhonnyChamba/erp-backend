import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * El campeonato se inicia por categoría de la edición (antes, toda la edición a la vez).
 * Idempotente y sin borrar datos. Mismo contenido que scripts/add-start-to-edition-category-details.sql.
 */
export class AddStartToEditionCategoryDetails1795500000000 implements MigrationInterface {
  name = 'AddStartToEditionCategoryDetails1795500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE public.tab_campeonato_edition_category_details ADD COLUMN IF NOT EXISTS started_at timestamp`);
    await queryRunner.query(`ALTER TABLE public.tab_campeonato_edition_category_details ADD COLUMN IF NOT EXISTS started_name varchar`);
    // Las categorías que ya tenían una etapa iniciada quedan iniciadas, con la fecha y el usuario del inicio de su edición
    await queryRunner.query(`
      UPDATE public.tab_campeonato_edition_category_details d
         SET started_at = COALESCE(e.started_at, now()), started_name = e.started_name
        FROM public.tab_campeonato_category_editions e
       WHERE e.id = d.edition_id
         AND d.started_at IS NULL
         AND EXISTS (
           SELECT 1 FROM public.tab_campeonato_stages s
            WHERE s.category_edition_id = d.edition_id
              AND s.category_id = d.category_id
              AND s.status <> 'PENDING'
         )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE public.tab_campeonato_edition_category_details DROP COLUMN IF EXISTS started_name`);
    await queryRunner.query(`ALTER TABLE public.tab_campeonato_edition_category_details DROP COLUMN IF EXISTS started_at`);
  }
}
