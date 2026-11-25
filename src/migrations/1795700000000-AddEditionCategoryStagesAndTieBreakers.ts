import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Etapas de cada categoría de la edición de torneo y sus criterios de desempate, que hasta ahora vivían en el jsonb
 * tab_campeonato_edition_category_details.stages. Ahora son dos subdetalles:
 *   - tab_campeonato_edition_category_stages        (una fila por etapa de la categoría)
 *   - tab_campeonato_edition_stage_tie_breakers     (una fila por criterio de la etapa, con su prioridad)
 *
 * Idempotente: crea las tablas si faltan y copia el jsonb solo de las categorías que todavía no tienen etapas en la tabla nueva.
 * Los tipos de competencia, vueltas y criterios que ya no existen en sus catálogos no se copian (el tipo y la vuelta quedan en NULL).
 * NO elimina la columna `stages` del detalle: queda como respaldo y se quita en una migración posterior, cuando se confirme la copia.
 */
export class AddEditionCategoryStagesAndTieBreakers1795700000000 implements MigrationInterface {
  name = 'AddEditionCategoryStagesAndTieBreakers1795700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS public.tab_campeonato_edition_category_stages (
        id                  SERIAL PRIMARY KEY,
        company_id          integer,
        category_detail_id  integer NOT NULL REFERENCES public.tab_campeonato_edition_category_details (id) ON DELETE CASCADE,
        stage_order         integer NOT NULL DEFAULT 1,
        name                varchar(150) NOT NULL,
        competition_type_id integer REFERENCES public.tab_campeonato_competition_types (id) ON DELETE SET NULL,
        competition_lap_id  integer REFERENCES public.tab_campeonato_competition_laps (id) ON DELETE SET NULL,
        created_name        varchar,
        created_by          varchar,
        created_at          timestamp NOT NULL DEFAULT now(),
        update_name         varchar,
        updated_by          varchar,
        updated_at          timestamp DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_tab_campeonato_edition_category_stages_detail" ON public.tab_campeonato_edition_category_stages (category_detail_id)`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS public.tab_campeonato_edition_stage_tie_breakers (
        id                       SERIAL PRIMARY KEY,
        company_id               integer,
        edition_stage_id         integer NOT NULL REFERENCES public.tab_campeonato_edition_category_stages (id) ON DELETE CASCADE,
        tie_breaker_criterion_id integer NOT NULL REFERENCES public.tab_campeonato_tie_breaker_criteria (id) ON DELETE RESTRICT,
        priority_order           integer NOT NULL DEFAULT 1,
        created_name             varchar,
        created_by               varchar,
        created_at               timestamp NOT NULL DEFAULT now(),
        update_name              varchar,
        updated_by               varchar,
        updated_at               timestamp DEFAULT now(),
        CONSTRAINT "UQ_tab_campeonato_edition_stage_tie_breakers_stage_criterion" UNIQUE (edition_stage_id, tie_breaker_criterion_id)
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_tab_campeonato_edition_stage_tie_breakers_stage" ON public.tab_campeonato_edition_stage_tie_breakers (edition_stage_id)`);

    // Copia de las etapas guardadas en el jsonb (solo categorías sin etapas en la tabla nueva)
    await queryRunner.query(`
      INSERT INTO public.tab_campeonato_edition_category_stages (company_id, category_detail_id, stage_order, name, competition_type_id, competition_lap_id, created_name, created_by)
      SELECT d.company_id,
             d.id,
             COALESCE(NULLIF(s.item ->> 'stageOrder', '')::integer, s.position::integer),
             COALESCE(NULLIF(btrim(s.item ->> 'name'), ''), 'Etapa ' || COALESCE(NULLIF(s.item ->> 'stageOrder', '')::integer, s.position::integer)),
             t.id,
             l.id,
             d.created_name,
             d.created_by
        FROM public.tab_campeonato_edition_category_details d
        CROSS JOIN LATERAL jsonb_array_elements(COALESCE(d.stages, '[]'::jsonb)) WITH ORDINALITY AS s(item, position)
        LEFT JOIN public.tab_campeonato_competition_types t ON t.id = NULLIF(s.item ->> 'competitionTypeId', '')::integer
        LEFT JOIN public.tab_campeonato_competition_laps l ON l.id = NULLIF(s.item ->> 'competitionLapId', '')::integer
       WHERE jsonb_typeof(d.stages) = 'array'
         AND NOT EXISTS (SELECT 1 FROM public.tab_campeonato_edition_category_stages x WHERE x.category_detail_id = d.id)
       ORDER BY d.id, s.position
    `);

    // Copia de los criterios de desempate de cada etapa copiada. La etapa se identifica por su posición dentro del jsonb:
    // las filas nuevas de una categoría se insertaron en ese mismo orden, así que la n-ésima fila corresponde al n-ésimo elemento.
    await queryRunner.query(`
      INSERT INTO public.tab_campeonato_edition_stage_tie_breakers (company_id, edition_stage_id, tie_breaker_criterion_id, priority_order, created_name, created_by)
      SELECT st.company_id, st.id, c.criterion_id, row_number() OVER (PARTITION BY st.id ORDER BY c.sort_order, c.position), st.created_name, st.created_by
        FROM (
          SELECT x.*, row_number() OVER (PARTITION BY x.category_detail_id ORDER BY x.id) AS position
            FROM public.tab_campeonato_edition_category_stages x
        ) st
        JOIN public.tab_campeonato_edition_category_details d ON d.id = st.category_detail_id
        CROSS JOIN LATERAL jsonb_array_elements(COALESCE(d.stages, '[]'::jsonb)) WITH ORDINALITY AS s(item, position)
        CROSS JOIN LATERAL (
          SELECT DISTINCT ON (k.criterion_id) k.criterion_id, k.sort_order, k.position
            FROM (
              SELECT COALESCE(NULLIF(c.item ->> 'criterionId', ''), NULLIF(c.item ->> 'id', ''))::integer AS criterion_id,
                     COALESCE(NULLIF(c.item ->> 'order', '')::integer, c.position::integer) AS sort_order,
                     c.position
                FROM jsonb_array_elements(COALESCE(s.item -> 'tieBreakerCriteria', '[]'::jsonb)) WITH ORDINALITY AS c(item, position)
              UNION ALL
              SELECT NULLIF(s.item ->> 'tieBreakerCriterionId', '')::integer, 0, 0
               WHERE jsonb_array_length(COALESCE(s.item -> 'tieBreakerCriteria', '[]'::jsonb)) = 0
            ) k
           WHERE k.criterion_id IS NOT NULL
           ORDER BY k.criterion_id, k.sort_order, k.position
        ) c
        WHERE s.position = st.position
          AND jsonb_typeof(d.stages) = 'array'
          AND EXISTS (SELECT 1 FROM public.tab_campeonato_tie_breaker_criteria tb WHERE tb.id = c.criterion_id)
          AND NOT EXISTS (SELECT 1 FROM public.tab_campeonato_edition_stage_tie_breakers y WHERE y.edition_stage_id = st.id)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // La columna jsonb `stages` no se tocó en `up`, así que la reversa solo elimina las dos tablas nuevas.
    await queryRunner.query(`DROP TABLE IF EXISTS public.tab_campeonato_edition_stage_tie_breakers`);
    await queryRunner.query(`DROP TABLE IF EXISTS public.tab_campeonato_edition_category_stages`);
  }
}
