import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Categoría de la edición en la que se tramita cada orden de transferencia de jugadores (tab_campeonato_player_transfers.category_id).
 * Es opcional. Idempotente y sin borrar datos. Mismo contenido que scripts/add-category-to-player-transfers.sql.
 */
export class AddCategoryToPlayerTransfers1795300000000 implements MigrationInterface {
  name = 'AddCategoryToPlayerTransfers1795300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE public.tab_campeonato_player_transfers ADD COLUMN IF NOT EXISTS category_id integer`);
    await queryRunner.query(`
      DO $transfer_category$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_tab_campeonato_player_transfers_category') THEN
          ALTER TABLE public.tab_campeonato_player_transfers
            ADD CONSTRAINT "FK_tab_campeonato_player_transfers_category"
            FOREIGN KEY (category_id) REFERENCES public.tab_campeonato_categories (id) ON DELETE SET NULL;
        END IF;
      END
      $transfer_category$;
    `);
    await queryRunner.query(`
      UPDATE public.tab_campeonato_player_transfers t
         SET category_id = tr.category_id
        FROM public.tab_campeonato_player_registrations pr
        JOIN public.tab_campeonato_team_registrations tr ON tr.id = pr.team_registration_id
       WHERE t.origin_registration_id = pr.id
         AND t.category_id IS NULL
         AND tr.category_id IS NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE public.tab_campeonato_player_transfers DROP CONSTRAINT IF EXISTS "FK_tab_campeonato_player_transfers_category"`);
    await queryRunner.query(`ALTER TABLE public.tab_campeonato_player_transfers DROP COLUMN IF EXISTS category_id`);
  }
}
