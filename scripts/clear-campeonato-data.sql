-- =====================================================================================================
-- Deskounta ERP · Limpieza de los datos de CAMPEONATO (PostgreSQL / Supabase)
-- =====================================================================================================
-- QUÉ HACE, en una sola transacción (si algo falla no se aplica nada):
--   1. Vacía las tablas tab_campeonato_* (ediciones, etapas, inscripciones, partidos, transferencias, órdenes de
--      pago, jugadores, equipos, etc.) y reinicia sus secuencias, de modo que los ids vuelven a empezar en 1.
--   2. NO toca las demás tablas del sistema (usuarios, empresas, módulos, otros submódulos) ni el historial de
--      migraciones.
--   3. Borra también la configuración de las ediciones de torneo: las ediciones con sus categorías y etapas y los
--      catálogos que esa configuración usa (tipos de competencia, vueltas, criterios de desempate, clasificaciones
--      de jugador, formatos de etapa y plantillas de etapas). Al volver a levantar el backend, los tipos de
--      competencia, las vueltas y los criterios de desempate se vuelven a crear con sus valores por defecto.
--   4. Conserva solo los catálogos de la lista c_keep_tables: demarcaciones y gremios de árbitros. Quita o agrega
--      nombres en esa lista para cambiar qué se conserva (por ejemplo, agrega 'tab_campeonato_players' o
--      'tab_campeonato_teams' si quieres conservar jugadores o equipos).
--
-- SEGURIDAD:
--   · Antes de borrar comprueba que ninguna tabla ajena a campeonato dependa por llave foránea de las que se
--     vacían. Si existe alguna, se detiene con un error y no se modifica nada (no se usa CASCADE).
--   · Muestra con NOTICE cuántas filas tiene cada tabla que se va a vaciar.
--   · TERMINA EN COMMIT: al ejecutarlo SÍ borra. Para ensayarlo sin aplicar nada, cambia el COMMIT del final por
--     ROLLBACK y revisa los mensajes y el resultado.
--
-- ES IRREVERSIBLE UNA VEZ CON COMMIT: saca un respaldo antes de aplicarlo en una base real.
-- =====================================================================================================

BEGIN;

DO $clear$
DECLARE
  -- Tablas de campeonato que NO se vacían (catálogos que no pertenecen a la configuración de las ediciones).
  c_keep_tables constant text[] := ARRAY[
    'tab_campeonato_demarcations',
    'tab_campeonato_referee_guilds'
  ];

  v_wipe  text[];
  v_deps  text;
  v_count bigint;
  v_total bigint := 0;
  r       record;
BEGIN
  -- ---------------------------------------------------------------------------------------------------
  -- 1. Tablas a vaciar: todas las tablas normales tab_campeonato_* de public, menos las conservadas.
  -- ---------------------------------------------------------------------------------------------------
  SELECT array_agg(c.relname::text ORDER BY c.relname)
    INTO v_wipe
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
   WHERE n.nspname = 'public'
     AND c.relkind IN ('r', 'p')
     AND c.relname LIKE 'tab\_campeonato\_%'
     AND NOT (c.relname = ANY (c_keep_tables));

  IF v_wipe IS NULL THEN
    RAISE EXCEPTION 'No se encontraron tablas tab_campeonato_* para vaciar; no se modificó nada.';
  END IF;

  -- ---------------------------------------------------------------------------------------------------
  -- 2. Seguridad: ninguna tabla que NO se vacía puede depender por llave foránea de las que sí se vacían.
  -- ---------------------------------------------------------------------------------------------------
  SELECT string_agg(DISTINCT format('%s → %s', child.relname, parent.relname), ', ')
    INTO v_deps
    FROM pg_constraint k
    JOIN pg_class child  ON child.oid = k.conrelid
    JOIN pg_class parent ON parent.oid = k.confrelid
    JOIN pg_namespace n  ON n.oid = child.relnamespace
   WHERE k.contype = 'f'
     AND n.nspname = 'public'
     AND parent.relname = ANY (v_wipe)
     AND NOT (child.relname = ANY (v_wipe));

  IF v_deps IS NOT NULL THEN
    RAISE EXCEPTION 'Hay tablas que no se vacían y dependen de tablas de campeonato (tabla → referencia): %. No se modificó nada.', v_deps;
  END IF;

  -- ---------------------------------------------------------------------------------------------------
  -- 3. Resumen de lo que se va a borrar.
  -- ---------------------------------------------------------------------------------------------------
  FOR r IN SELECT t FROM unnest(v_wipe) AS t LOOP
    EXECUTE format('SELECT count(*) FROM public.%I', r.t) INTO v_count;
    IF v_count > 0 THEN
      RAISE NOTICE '% fila(s) en %', v_count, r.t;
      v_total := v_total + v_count;
    END IF;
  END LOOP;
  RAISE NOTICE 'Total: % fila(s) en % tabla(s) de campeonato.', v_total, array_length(v_wipe, 1);

  -- ---------------------------------------------------------------------------------------------------
  -- 4. Vaciado: todas las tablas en una sola instrucción (así las llaves foráneas entre ellas no estorban) y
  --    reinicio de las secuencias.
  -- ---------------------------------------------------------------------------------------------------
  EXECUTE 'TRUNCATE TABLE '
    || (SELECT string_agg(format('public.%I', t), ', ') FROM unnest(v_wipe) AS t)
    || ' RESTART IDENTITY';

  RAISE NOTICE 'Se vaciaron % tabla(s) de campeonato. Se conservaron: %.', array_length(v_wipe, 1), array_to_string(c_keep_tables, ', ');
END
$clear$;

-- Verificación: filas que quedan en cada tabla de campeonato (las conservadas conservan sus datos).
SELECT table_name AS tabla,
       (xpath('/row/filas/text()', query_to_xml(format('SELECT count(*) AS filas FROM public.%I', table_name), false, true, '')))[1]::text::bigint AS filas
  FROM information_schema.tables
 WHERE table_schema = 'public'
   AND table_type = 'BASE TABLE'
   AND table_name LIKE 'tab\_campeonato\_%'
 ORDER BY filas DESC, table_name;

-- APLICA el borrado. Para ensayar sin borrar nada, cambia COMMIT por ROLLBACK.
COMMIT;
