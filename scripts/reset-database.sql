-- =====================================================================================================
-- Deskounta ERP · Limpieza de la base de datos (PostgreSQL / Supabase)
-- =====================================================================================================
-- QUÉ HACE, en una sola transacción (si algo falla no se aplica nada):
--   1. Vacía TODAS las tablas del esquema public y reinicia sus secuencias, excepto:
--        · tab_module y tab_sub_module (módulos y submódulos);
--        · los catálogos globales de campeonato (lista c_keep_tables más abajo);
--        · tab_users, donde solo queda el usuario jc@gmail.com.
--   2. Convierte a entero autogenerado (SERIAL: secuencia propia + DEFAULT nextval) toda columna "id" que hoy
--      sea VARCHAR / TEXT / UUID, junto con las columnas que la referencian por llave foránea. Las filas que se
--      conservan reciben un id nuevo (1, 2, 3...) y sus referencias se actualizan con ese mismo id.
--   3. Convierte a entero las columnas de identificador sueltas de campeonato que eran texto
--      (performed_by_id, approver_user_id, tournaments_id).
--
-- ES IRREVERSIBLE: saca un respaldo antes. Para ensayarlo sin aplicar nada, cambia el COMMIT final por ROLLBACK
-- y revisa los mensajes NOTICE.
--
-- DESPUÉS DE EJECUTARLO: el usuario que queda pierde su empresa y su rol (esas tablas se vacían). Solo podrá
-- entrar si es super administrador; al final del script se muestra si lo es.
-- =====================================================================================================

BEGIN;

DO $reset$
DECLARE
  -- Usuario que se conserva.
  c_keep_email  constant text := 'jc@gmail.com';
  c_users       constant text := 'tab_users';

  -- Tablas que NO se vacían. Quita o agrega aquí si quieres conservar algo más (por ejemplo el padrón global
  -- de jugadores 'tab_campeonato_players' o de árbitros 'tab_campeonato_referees', que este script SÍ vacía).
  c_keep_tables constant text[] := ARRAY[
    'tab_module',
    'tab_sub_module',
    -- Configuración global de campeonato
    'tab_campeonato_competition_types',
    'tab_campeonato_competition_laps',
    'tab_campeonato_tie_breaker_criteria',
    'tab_campeonato_player_classifications',
    'tab_campeonato_demarcations',
    'tab_campeonato_stage_formats',
    'tab_campeonato_referee_guilds'
  ];

  -- Tablas técnicas que no se tocan (historial de migraciones de TypeORM).
  c_skip_tables constant text[] := ARRAY['migrations', 'typeorm_metadata'];

  -- Columnas de identificador sin llave foránea que estaban como texto (solo en tablas tab_campeonato_*).
  c_loose_id_columns constant text[] := ARRAY['performed_by_id', 'approver_user_id', 'tournaments_id'];

  v_keep_user_id text;
  v_all_keep     text[];
  v_wipe         text[];
  v_count        bigint;
  v_flag         text;
  r              record;
BEGIN
  -- ---------------------------------------------------------------------------------------------------
  -- 0. Comprobaciones: sin el usuario a conservar no se borra nada.
  -- ---------------------------------------------------------------------------------------------------
  IF to_regclass(format('public.%I', c_users)) IS NULL THEN
    RAISE EXCEPTION 'No existe la tabla public.%; no se modificó nada.', c_users;
  END IF;

  EXECUTE format('SELECT id::text FROM public.%I WHERE lower(trim(email)) = lower($1) ORDER BY id::text LIMIT 1', c_users)
    INTO v_keep_user_id USING c_keep_email;

  IF v_keep_user_id IS NULL THEN
    RAISE EXCEPTION 'No existe el usuario % en %; no se modificó nada.', c_keep_email, c_users;
  END IF;

  v_all_keep := c_keep_tables || c_users;

  FOR r IN SELECT t FROM unnest(c_keep_tables) AS t WHERE to_regclass(format('public.%I', t)) IS NULL LOOP
    RAISE NOTICE 'Aviso: la tabla a conservar % no existe en esta base.', r.t;
  END LOOP;

  -- Tablas a vaciar: todas las tablas normales de public, menos las conservadas, las técnicas y las de extensiones.
  SELECT array_agg(c.relname::text ORDER BY c.relname)
    INTO v_wipe
    FROM pg_class c
   WHERE c.relnamespace = 'public'::regnamespace
     AND c.relkind IN ('r', 'p')
     AND NOT c.relispartition
     AND c.relname <> ALL (v_all_keep)
     AND c.relname <> ALL (c_skip_tables)
     AND NOT EXISTS (SELECT 1 FROM pg_depend d WHERE d.classid = 'pg_class'::regclass AND d.objid = c.oid AND d.deptype = 'e');

  CREATE TEMP TABLE _saved_fk (phase int, child text, conname text, def text, col text, parent text) ON COMMIT DROP;

  -- ---------------------------------------------------------------------------------------------------
  -- 1. Vaciar tablas.
  -- ---------------------------------------------------------------------------------------------------
  IF v_wipe IS NOT NULL THEN
    -- Las tablas conservadas pueden apuntar a tablas que se vacían (p. ej. tab_users → tab_company). Esas llaves
    -- foráneas se quitan, las columnas quedan en NULL y la llave se vuelve a crear al final de este paso.
    INSERT INTO _saved_fk
    SELECT 1, ch.relname, con.conname, pg_get_constraintdef(con.oid), a.attname, pa.relname
      FROM pg_constraint con
      JOIN pg_class ch ON ch.oid = con.conrelid
      JOIN pg_class pa ON pa.oid = con.confrelid
      JOIN pg_attribute a ON a.attrelid = con.conrelid AND a.attnum = con.conkey[1]
     WHERE con.contype = 'f'
       AND ch.relnamespace = 'public'::regnamespace
       AND ch.relname = ANY (v_all_keep)
       AND pa.relnamespace = 'public'::regnamespace
       AND pa.relname = ANY (v_wipe);

    FOR r IN SELECT * FROM _saved_fk WHERE phase = 1 LOOP
      EXECUTE format('ALTER TABLE public.%I DROP CONSTRAINT %I', r.child, r.conname);
    END LOOP;

    EXECUTE 'TRUNCATE TABLE ' || (SELECT string_agg(format('public.%I', t), ', ') FROM unnest(v_wipe) AS t) || ' RESTART IDENTITY';
    RAISE NOTICE 'Tablas vaciadas: %', array_length(v_wipe, 1);
  END IF;

  -- Otros usuarios: primero se sueltan las referencias que otras tablas conservadas tengan hacia ellos.
  FOR r IN
    SELECT ch.relname AS child, a.attname AS col
      FROM pg_constraint con
      JOIN pg_class ch ON ch.oid = con.conrelid
      JOIN pg_class pa ON pa.oid = con.confrelid
      JOIN pg_attribute a ON a.attrelid = con.conrelid AND a.attnum = con.conkey[1]
     WHERE con.contype = 'f'
       AND ch.relnamespace = 'public'::regnamespace
       AND ch.relname = ANY (v_all_keep)
       AND pa.relnamespace = 'public'::regnamespace
       AND pa.relname = c_users
  LOOP
    EXECUTE format('UPDATE public.%I SET %I = NULL WHERE %I IS NOT NULL AND %I::text <> $1', r.child, r.col, r.col, r.col) USING v_keep_user_id;
  END LOOP;

  EXECUTE format('DELETE FROM public.%I WHERE id::text <> $1', c_users) USING v_keep_user_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RAISE NOTICE 'Usuarios eliminados: % (se conserva %)', v_count, c_keep_email;

  -- Columnas de las tablas conservadas que apuntaban a tablas vaciadas: quedan en NULL y se recrea la llave.
  FOR r IN SELECT * FROM _saved_fk WHERE phase = 1 LOOP
    IF EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = format('public.%I', r.child)::regclass AND attname = r.col AND attnotnull) THEN
      EXECUTE format('ALTER TABLE public.%I ALTER COLUMN %I DROP NOT NULL', r.child, r.col);
      RAISE NOTICE 'Aviso: %.% era NOT NULL y ahora admite NULL (apuntaba a %, que se vació).', r.child, r.col, r.parent;
    END IF;

    EXECUTE format('UPDATE public.%I SET %I = NULL WHERE %I IS NOT NULL', r.child, r.col, r.col);
    EXECUTE format('ALTER TABLE public.%I ADD CONSTRAINT %I %s', r.child, r.conname, r.def);
  END LOOP;

  -- ---------------------------------------------------------------------------------------------------
  -- 2. Columnas "id" de texto → entero autogenerado.
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
  -- 3. Identificadores sueltos de campeonato que eran texto → entero (un valor no numérico queda en NULL).
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

  -- ---------------------------------------------------------------------------------------------------
  -- Resumen de lo que quedó.
  -- ---------------------------------------------------------------------------------------------------
  FOR r IN SELECT t FROM unnest(v_all_keep) AS t WHERE to_regclass(format('public.%I', t)) IS NOT NULL ORDER BY t LOOP
    EXECUTE format('SELECT count(*) FROM public.%I', r.t) INTO v_count;
    RAISE NOTICE 'Conservada: % (% filas)', r.t, v_count;
  END LOOP;

  IF EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = format('public.%I', c_users)::regclass AND attname = 'super_admin' AND NOT attisdropped) THEN
    EXECUTE format('SELECT super_admin::text FROM public.%I LIMIT 1', c_users) INTO v_flag;
    RAISE NOTICE 'Usuario %: super_admin = %. Si no es super administrador no podrá entrar hasta que tenga una empresa.', c_keep_email, v_flag;
  END IF;
END
$reset$;

-- Para ensayar sin aplicar cambios, reemplaza COMMIT por ROLLBACK.
COMMIT;
