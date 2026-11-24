import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Demarcación / posición en campo de cada jugador inscrito en una plantilla (tab_campeonato_player_registrations.demarcation_id).
 * Es opcional: si no se elige, vale la del jugador. Idempotente y sin borrar datos.
 * Mismo contenido que scripts/add-demarcation-to-player-registrations.sql.
 */
export class AddDemarcationToPlayerRegistrations1795200000000 implements MigrationInterface {
  name = 'AddDemarcationToPlayerRegistrations1795200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE public.tab_campeonato_player_registrations ADD COLUMN IF NOT EXISTS demarcation_id integer`);
    await queryRunner.query(`
      DO $demarcation$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_tab_campeonato_player_registrations_demarcation') THEN
          ALTER TABLE public.tab_campeonato_player_registrations
            ADD CONSTRAINT "FK_tab_campeonato_player_registrations_demarcation"
            FOREIGN KEY (demarcation_id) REFERENCES public.tab_campeonato_demarcations (id) ON DELETE SET NULL;
        END IF;
      END
      $demarcation$;
    `);
    await queryRunner.query(`
      UPDATE public.tab_campeonato_player_registrations pr
         SET demarcation_id = p.demarcation_id
        FROM public.tab_campeonato_players p
       WHERE pr.player_id = p.id
         AND pr.demarcation_id IS NULL
         AND p.demarcation_id IS NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE public.tab_campeonato_player_registrations DROP CONSTRAINT IF EXISTS "FK_tab_campeonato_player_registrations_demarcation"`);
    await queryRunner.query(`ALTER TABLE public.tab_campeonato_player_registrations DROP COLUMN IF EXISTS demarcation_id`);
  }
}
