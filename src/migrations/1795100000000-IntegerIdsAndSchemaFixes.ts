import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Cambios de esquema que acompañan las correcciones de noviembre de 2026. No borra datos y se puede repetir.
 *   0. Todo "id" de texto (VARCHAR / TEXT / UUID) pasa a entero autogenerado (SERIAL) junto con sus llaves foráneas;
 *      performed_by_id, approver_user_id y tournaments_id de campeonato pasan a entero.
 *   1. Citas: order_number único por empresa.
 *   2. Tabla tab_campeonato_edition_scenaries.
 *   3. Secuencia de notas de crédito con el nombre que usa el código.
 * Mismo contenido que scripts/schema-updates.sql (generado desde ese archivo).
 */
export class IntegerIdsAndSchemaFixes1795100000000 implements MigrationInterface {
  name = 'IntegerIdsAndSchemaFixes1795100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(SCHEMA_FIXES_SQL);
  }

  // La conversión de ids de texto a enteros no es reversible: los identificadores anteriores no se conservan.
  public async down(): Promise<void> {}
}

const SCHEMA_FIXES_SQL = String.raw`
DO $schema$
DECLARE
  c_skip_tables      constant text[] := ARRAY['migrations', 'typeorm_metadata'];
  c_loose_id_columns constant text[] := ARRAY['performed_by_id', 'approver_user_id', 'tournaments_id'];
  r record;
BEGIN
  CREATE TEMP TABLE _saved_fk (phase int, child text, conname text, def text, col text, parent text) ON COMMIT DROP;

  -- ---------------------------------------------------------------------------------------------------
  -- 0. Columnas "id" de texto → entero autogenerado (conserva las filas: les asigna 1, 2, 3... y actualiza sus referencias).
  -- ---------------------------------------------------------------------------------------------------
  CREATE TEMP TABLE _id_conv ON COMMIT DROP AS
  SELECT c.relname::text AS tbl
    FROM pg_class c
    JOIN pg_attribute a ON a.attrelid = c.oid AND a.attname = 'id' AND NOT a.attisdropped
   WHERE c.relnamespace = 'public'::regnamespace
     AND c.relkind IN ('r', 'p')
     AND NOT c.relispartition
     AND c.relname <> ALL (c_skip_tables)
     AND NOT EXISTS (SELECT 1 FROM pg_depend d WHERE d.classid = 'pg_class'::regclass AND d.objid = c.oid AND d.deptype = 'e')
     AND a.atttypid NOT IN ('int2'::regtype, 'int4'::regtype, 'int8'::regtype);

  -- Correspondencia id anterior → id nuevo de las filas que quedaron.
  CREATE TEMP TABLE _id_map (tbl text, old_id text, new_id integer, PRIMARY KEY (tbl, old_id)) ON COMMIT DROP;

  FOR r IN SELECT tbl FROM _id_conv ORDER BY tbl LOOP
    EXECUTE format('INSERT INTO _id_map SELECT %L, id::text, row_number() OVER (ORDER BY id::text) FROM public.%I', r.tbl, r.tbl);
  END LOOP;

  EXECUTE $fn$
    CREATE OR REPLACE FUNCTION pg_temp._map_id(p_tbl text, p_old text) RETURNS integer
    LANGUAGE sql STABLE AS 'SELECT m.new_id FROM _id_map m WHERE m.tbl = p_tbl AND m.old_id = p_old'
  $fn$;

  -- Llaves foráneas que apuntan a esos id: se quitan, se convierten las dos puntas y se vuelven a crear.
  IF EXISTS (
    SELECT 1
      FROM pg_constraint con
      JOIN pg_class pa ON pa.oid = con.confrelid
     WHERE con.contype = 'f' AND pa.relnamespace = 'public'::regnamespace
       AND pa.relname IN (SELECT tbl FROM _id_conv) AND array_length(con.conkey, 1) > 1
  ) THEN
    RAISE EXCEPTION 'Hay llaves foráneas compuestas hacia una tabla con id de texto; conviértelas a mano. No se modificó nada.';
  END IF;

  INSERT INTO _saved_fk
  SELECT 2, ch.relname, con.conname, pg_get_constraintdef(con.oid), a.attname, pa.relname
    FROM pg_constraint con
    JOIN pg_class ch ON ch.oid = con.conrelid
    JOIN pg_class pa ON pa.oid = con.confrelid
    JOIN pg_attribute a ON a.attrelid = con.conrelid AND a.attnum = con.conkey[1]
    JOIN pg_attribute pk ON pk.attrelid = con.confrelid AND pk.attnum = con.confkey[1]
   WHERE con.contype = 'f'
     AND pa.relnamespace = 'public'::regnamespace
     AND pa.relname IN (SELECT tbl FROM _id_conv)
     AND pk.attname = 'id';

  IF EXISTS (SELECT 1 FROM _saved_fk WHERE phase = 2 AND col = 'id') THEN
    RAISE EXCEPTION 'Una tabla usa su propio id como llave foránea hacia otra con id de texto; conviértela a mano. No se modificó nada.';
  END IF;

  FOR r IN SELECT * FROM _saved_fk WHERE phase = 2 LOOP
    EXECUTE format('ALTER TABLE public.%I DROP CONSTRAINT %I', r.child, r.conname);
  END LOOP;

  FOR r IN SELECT DISTINCT child, col, parent FROM _saved_fk WHERE phase = 2 ORDER BY child, col LOOP
    IF EXISTS (
      SELECT 1 FROM pg_attribute
       WHERE attrelid = format('public.%I', r.child)::regclass AND attname = r.col
         AND atttypid NOT IN ('int2'::regtype, 'int4'::regtype, 'int8'::regtype)
    ) THEN
      EXECUTE format('ALTER TABLE public.%I ALTER COLUMN %I DROP DEFAULT', r.child, r.col);
      EXECUTE format('ALTER TABLE public.%I ALTER COLUMN %I TYPE integer USING pg_temp._map_id(%L, %I::text)', r.child, r.col, r.parent, r.col);
      RAISE NOTICE 'Columna convertida a entero: %.% (referencia a %)', r.child, r.col, r.parent;
    END IF;
  END LOOP;

  FOR r IN SELECT tbl FROM _id_conv ORDER BY tbl LOOP
    EXECUTE format('ALTER TABLE public.%I ALTER COLUMN id DROP DEFAULT', r.tbl);
    EXECUTE format('ALTER TABLE public.%I ALTER COLUMN id TYPE integer USING pg_temp._map_id(%L, id::text)', r.tbl, r.tbl);
    RAISE NOTICE 'Id convertido a entero: %', r.tbl;
  END LOOP;

  FOR r IN SELECT * FROM _saved_fk WHERE phase = 2 LOOP
    EXECUTE format('ALTER TABLE public.%I ADD CONSTRAINT %I %s', r.child, r.conname, r.def);
  END LOOP;

  -- Todo "id" entero sin generación automática recibe su secuencia (equivalente a SERIAL), continuando desde el mayor id.
  FOR r IN
    SELECT c.relname::text AS tbl
      FROM pg_class c
      JOIN pg_attribute a ON a.attrelid = c.oid AND a.attname = 'id' AND NOT a.attisdropped
     WHERE c.relnamespace = 'public'::regnamespace
       AND c.relkind IN ('r', 'p')
       AND NOT c.relispartition
       AND c.relname <> ALL (c_skip_tables)
       AND NOT EXISTS (SELECT 1 FROM pg_depend d WHERE d.classid = 'pg_class'::regclass AND d.objid = c.oid AND d.deptype = 'e')
       AND a.atttypid IN ('int2'::regtype, 'int4'::regtype, 'int8'::regtype)
       AND a.attidentity = ''
       AND NOT a.atthasdef
     ORDER BY c.relname
  LOOP
    EXECUTE format('CREATE SEQUENCE IF NOT EXISTS public.%I', r.tbl || '_id_seq');
    EXECUTE format('ALTER SEQUENCE public.%I OWNED BY public.%I.id', r.tbl || '_id_seq', r.tbl);
    EXECUTE format('ALTER TABLE public.%I ALTER COLUMN id SET DEFAULT nextval(%L)', r.tbl, format('public.%I', r.tbl || '_id_seq'));
    EXECUTE format('ALTER TABLE public.%I ALTER COLUMN id SET NOT NULL', r.tbl);
    EXECUTE format('SELECT setval(%L, COALESCE((SELECT max(id) FROM public.%I), 0) + 1, false)', format('public.%I', r.tbl || '_id_seq'), r.tbl);
    RAISE NOTICE 'Id autogenerado (SERIAL): %', r.tbl;
  END LOOP;

  -- ---------------------------------------------------------------------------------------------------
  -- 0b. Identificadores sueltos de campeonato que eran texto → entero (un valor no numérico queda en NULL).
  -- ---------------------------------------------------------------------------------------------------
  FOR r IN
    SELECT c.relname::text AS tbl, a.attname::text AS col
      FROM pg_class c
      JOIN pg_attribute a ON a.attrelid = c.oid AND NOT a.attisdropped
     WHERE c.relnamespace = 'public'::regnamespace
       AND c.relkind IN ('r', 'p')
       AND c.relname LIKE 'tab\_campeonato\_%'
       AND a.attname = ANY (c_loose_id_columns)
       AND a.atttypid NOT IN ('int2'::regtype, 'int4'::regtype, 'int8'::regtype)
     ORDER BY c.relname, a.attname
  LOOP
    EXECUTE format('ALTER TABLE public.%I ALTER COLUMN %I DROP DEFAULT', r.tbl, r.col);
    EXECUTE format('ALTER TABLE public.%I ALTER COLUMN %I TYPE integer USING CASE WHEN %I::text ~ %L THEN %I::text::integer END', r.tbl, r.col, r.col, '^[0-9]{1,9}$', r.col);
    RAISE NOTICE 'Columna convertida a entero: %.%', r.tbl, r.col;
  END LOOP;

  -- 1. tab_appointments: quitar cualquier unicidad que sea solo sobre order_number y crear (company_id, order_number).
  IF to_regclass('public.tab_appointments') IS NOT NULL THEN
    FOR r IN
      SELECT con.conname
        FROM pg_constraint con
       WHERE con.conrelid = 'public.tab_appointments'::regclass
         AND con.contype = 'u'
         AND array_length(con.conkey, 1) = 1
         AND (SELECT a.attname FROM pg_attribute a WHERE a.attrelid = con.conrelid AND a.attnum = con.conkey[1]) = 'order_number'
    LOOP
      EXECUTE format('ALTER TABLE public.tab_appointments DROP CONSTRAINT %I', r.conname);
      RAISE NOTICE 'tab_appointments: se quitó la unicidad global %', r.conname;
    END LOOP;

    FOR r IN
      SELECT i.relname AS index_name
        FROM pg_index ix
        JOIN pg_class i ON i.oid = ix.indexrelid
       WHERE ix.indrelid = 'public.tab_appointments'::regclass
         AND ix.indisunique
         AND NOT ix.indisprimary
         AND ix.indnkeyatts = 1
         AND (SELECT a.attname FROM pg_attribute a WHERE a.attrelid = ix.indrelid AND a.attnum = ix.indkey[0]) = 'order_number'
    LOOP
      EXECUTE format('DROP INDEX public.%I', r.index_name);
      RAISE NOTICE 'tab_appointments: se quitó el índice único global %', r.index_name;
    END LOOP;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'public.tab_appointments'::regclass AND conname = 'UQ_tab_appointments_company_order_number') THEN
      ALTER TABLE public.tab_appointments ADD CONSTRAINT "UQ_tab_appointments_company_order_number" UNIQUE (company_id, order_number);
      RAISE NOTICE 'tab_appointments: unicidad por (company_id, order_number) creada';
    END IF;
  ELSE
    RAISE NOTICE 'Aviso: no existe tab_appointments; se omite el paso 1.';
  END IF;

  -- 2. Escenarios habilitados por edición de torneo.
  IF to_regclass('public.tab_campeonato_category_editions') IS NOT NULL AND to_regclass('public.tab_campeonato_scenaries') IS NOT NULL THEN
    CREATE TABLE IF NOT EXISTS public.tab_campeonato_edition_scenaries (
      id         SERIAL PRIMARY KEY,
      company_id integer,
      edition_id integer NOT NULL REFERENCES public.tab_campeonato_category_editions (id) ON DELETE CASCADE,
      scenary_id integer NOT NULL REFERENCES public.tab_campeonato_scenaries (id) ON DELETE CASCADE,
      created_at timestamp NOT NULL DEFAULT now(),
      CONSTRAINT "UQ_tab_campeonato_edition_scenaries_edition_scenary" UNIQUE (edition_id, scenary_id)
    );
  ELSE
    RAISE NOTICE 'Aviso: faltan las tablas de ediciones o escenarios de campeonato; se omite el paso 2.';
  END IF;

  -- 3. Secuencia de notas de crédito: el código usa 'NOTAS DE CRÉDITO'. Se renombra la fila antigua solo si el
  --    mismo punto de emisión no tiene ya una con el nombre correcto.
  IF to_regclass('public.tab_emission_point_sequence') IS NOT NULL THEN
    UPDATE public.tab_emission_point_sequence s
       SET document_type = 'NOTAS DE CRÉDITO'
     WHERE s.document_type = 'NOTAS_CREDITO'
       AND NOT EXISTS (
         SELECT 1 FROM public.tab_emission_point_sequence o
          WHERE o.emission_point_id = s.emission_point_id AND o.document_type = 'NOTAS DE CRÉDITO'
       );
  END IF;
END
$schema$;
`;
