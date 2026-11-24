import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Etapas con estado (pendiente / en proceso), inicio único del campeonato por edición y partidos sin fecha obligatoria.
 * Idempotente y sin borrar datos. Mismo contenido que scripts/add-stage-status-and-edition-start.sql.
 */
export class AddStageStatusAndEditionStart1795400000000 implements MigrationInterface {
  name = 'AddStageStatusAndEditionStart1795400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE public.tab_campeonato_stages ADD COLUMN IF NOT EXISTS status varchar(20) NOT NULL DEFAULT 'PENDING'`);
    await queryRunner.query(`ALTER TABLE public.tab_campeonato_stages ADD COLUMN IF NOT EXISTS started_at timestamp`);
    await queryRunner.query(`ALTER TABLE public.tab_campeonato_stages ADD COLUMN IF NOT EXISTS competition_type_code varchar(50)`);
    await queryRunner.query(`ALTER TABLE public.tab_campeonato_stages ADD COLUMN IF NOT EXISTS from_edition boolean NOT NULL DEFAULT false`);
    await queryRunner.query(`ALTER TABLE public.tab_campeonato_category_editions ADD COLUMN IF NOT EXISTS started_at timestamp`);
    await queryRunner.query(`ALTER TABLE public.tab_campeonato_category_editions ADD COLUMN IF NOT EXISTS started_name varchar`);
    await queryRunner.query(`ALTER TABLE public.tab_campeonato_matches ALTER COLUMN date DROP NOT NULL`);
    await queryRunner.query(`
      UPDATE public.tab_campeonato_stages s
         SET status = 'IN_PROGRESS', started_at = COALESCE(s.started_at, now())
       WHERE s.status = 'PENDING'
         AND EXISTS (SELECT 1 FROM public.tab_campeonato_matches m WHERE m.stage_id = s.id)
    `);
    await queryRunner.query(`
      UPDATE public.tab_campeonato_category_editions e
         SET started_at = now()
       WHERE e.started_at IS NULL
         AND EXISTS (
           SELECT 1 FROM public.tab_campeonato_stages s
             JOIN public.tab_campeonato_matches m ON m.stage_id = s.id
            WHERE s.category_edition_id = e.id
         )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE public.tab_campeonato_category_editions DROP COLUMN IF EXISTS started_name`);
    await queryRunner.query(`ALTER TABLE public.tab_campeonato_category_editions DROP COLUMN IF EXISTS started_at`);
    await queryRunner.query(`ALTER TABLE public.tab_campeonato_stages DROP COLUMN IF EXISTS from_edition`);
    await queryRunner.query(`ALTER TABLE public.tab_campeonato_stages DROP COLUMN IF EXISTS competition_type_code`);
    await queryRunner.query(`ALTER TABLE public.tab_campeonato_stages DROP COLUMN IF EXISTS started_at`);
    await queryRunner.query(`ALTER TABLE public.tab_campeonato_stages DROP COLUMN IF EXISTS status`);
  }
}
