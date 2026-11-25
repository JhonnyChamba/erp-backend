-- =====================================================================================================
-- Deskounta ERP · Catálogos Deportivos Globales: Gremios Arbitrales, Árbitros y Futbolistas
-- =====================================================================================================
-- Registra directamente en SQL la información de los tres módulos del menú «Catálogos Deportivos»:
--   1. Gremios Arbitrales  → public.tab_campeonato_referee_guilds   (6 gremios)
--   2. Árbitros            → public.tab_campeonato_referees         (24 árbitros, 4 por gremio)
--   3. Futbolistas         → public.tab_campeonato_players          (40 futbolistas del padrón global)
--
-- Todo es DATOS DE EJEMPLO (nombres, teléfonos y correos ficticios) con:
--   * Cédulas ecuatorianas de 10 dígitos válidas (algoritmo oficial Módulo 10 del Registro Civil).
--   * Futbolistas con código secuencial JUG-XXXXX (continúa desde el último existente), edad en años y
--     meses calculada y, si existen, demarcación y clasificación asignadas de forma rotativa desde sus catálogos.
--   * Los árbitros quedan ligados a su gremio por la descripción del gremio (por eso los gremios se cargan primero).
--
-- ES IDEMPOTENTE: no duplica nada que ya exista (gremios por descripción; árbitros y futbolistas por cédula).
-- Se puede ejecutar varias veces. Si ya cargaste scripts/seed-global-players-100.sql, los futbolistas de este
-- script usan otras cédulas (bloque 17147xxxx) y se suman a esos 100.
--
-- Todo corre en una sola transacción (si algo falla no se aplica nada) y TERMINA EN COMMIT.
-- Para ensayarlo sin guardar, cambia el COMMIT final por ROLLBACK.
--
-- Para revertir esta carga:
--   DELETE FROM public.tab_campeonato_players       WHERE created_name = 'CARGA SQL CATALOGOS GLOBALES';
--   DELETE FROM public.tab_campeonato_referees      WHERE created_name = 'CARGA SQL CATALOGOS GLOBALES';
--   DELETE FROM public.tab_campeonato_referee_guilds WHERE created_name = 'CARGA SQL CATALOGOS GLOBALES';
-- =====================================================================================================

BEGIN;

-- Cédula completa a partir de sus 9 primeros dígitos (agrega el dígito verificador Módulo 10).
CREATE OR REPLACE FUNCTION pg_temp.ec_cedula(base9 text) RETURNS text
LANGUAGE plpgsql IMMUTABLE AS $fn$
DECLARE
  v_coefs integer[] := ARRAY[2,1,2,1,2,1,2,1,2];
  v_sum   integer := 0;
  v_prod  integer;
  i       integer;
BEGIN
  FOR i IN 1..9 LOOP
    v_prod := CAST(SUBSTRING(base9 FROM i FOR 1) AS integer) * v_coefs[i];
    IF v_prod >= 10 THEN
      v_prod := v_prod - 9;
    END IF;
    v_sum := v_sum + v_prod;
  END LOOP;

  RETURN base9 || (CASE WHEN v_sum % 10 = 0 THEN 0 ELSE 10 - (v_sum % 10) END)::text;
END
$fn$;

-- ---------------------------------------------------------------------------------------------------
-- 1. GREMIOS ARBITRALES
-- ---------------------------------------------------------------------------------------------------
-- Gremios a cargar (la tabla temporal también liga a los árbitros y desaparece al terminar la transacción).
CREATE TEMP TABLE seed_guilds ON COMMIT DROP AS
SELECT * FROM (VALUES
  ('Asociación de Árbitros de Fútbol de Pichincha',  'AAFP'),
  ('Asociación de Árbitros de Fútbol del Guayas',    'AAFG'),
  ('Asociación de Árbitros de Fútbol del Azuay',     'AAFA'),
  ('Asociación de Árbitros de Fútbol de Manabí',     'AAFM'),
  ('Asociación de Árbitros de Fútbol de Tungurahua', 'AAFT'),
  ('Colegio de Árbitros Barriales de Quito',         'CABQ')
) AS v(description, acronyms);

DO $guilds$
DECLARE
  v_inserted integer;
BEGIN
  INSERT INTO public.tab_campeonato_referee_guilds (description, acronyms, is_active, created_name, created_by)
  SELECT v.description, v.acronyms, true, 'CARGA SQL CATALOGOS GLOBALES', '1'
    FROM seed_guilds v
   WHERE NOT EXISTS (
     SELECT 1 FROM public.tab_campeonato_referee_guilds g
      WHERE lower(trim(g.description)) = lower(trim(v.description))
   );

  GET DIAGNOSTICS v_inserted = ROW_COUNT;
  RAISE NOTICE 'Gremios Arbitrales: % insertado(s).', v_inserted;
END
$guilds$;

-- ---------------------------------------------------------------------------------------------------
-- 2. ÁRBITROS (global, sin empresa): cada uno ligado a su gremio por las siglas
-- ---------------------------------------------------------------------------------------------------
DO $referees$
DECLARE
  v_inserted integer;
BEGIN
  INSERT INTO public.tab_campeonato_referees (company_id, guild_id, name, last_name, identification, phone, email, is_active, created_name, created_by)
  SELECT NULL, g.id, v.first_name, v.last_name, pg_temp.ec_cedula(v.base9), v.phone, v.email, true, 'CARGA SQL CATALOGOS GLOBALES', '1'
    FROM (VALUES
      -- Pichincha (AAFP)
      ('171480001', 'AAFP', 'Mauricio Javier',   'Andrade Villavicencio', '0987001001', 'mauricio.andrade@arbitros.ec'),
      ('171480002', 'AAFP', 'Fernando Xavier',   'Bonilla Sandoval',      '0987001002', 'fernando.bonilla@arbitros.ec'),
      ('171480003', 'AAFP', 'Paola Alexandra',   'Cisneros Paredes',      '0987001003', 'paola.cisneros@arbitros.ec'),
      ('171480004', 'AAFP', 'Wilson Patricio',   'Echeverría Montalvo',   '0987001004', 'wilson.echeverria@arbitros.ec'),
      -- Guayas (AAFG)
      ('091480001', 'AAFG', 'Jimmy Alberto',     'Alcívar Zambrano',      '0987002001', 'jimmy.alcivar@arbitros.ec'),
      ('091480002', 'AAFG', 'Katherine Estefanía','Burgos Villamar',      '0987002002', 'katherine.burgos@arbitros.ec'),
      ('091480003', 'AAFG', 'Ronald Eduardo',    'Cedeño Plúa',           '0987002003', 'ronald.cedeno@arbitros.ec'),
      ('091480004', 'AAFG', 'Henry Stalin',      'Franco Mendoza',        '0987002004', 'henry.franco@arbitros.ec'),
      -- Azuay (AAFA)
      ('011480001', 'AAFA', 'Pablo Esteban',     'Arévalo Cordero',       '0987003001', 'pablo.arevalo@arbitros.ec'),
      ('011480002', 'AAFA', 'Verónica Isabel',   'Brito Calle',           '0987003002', 'veronica.brito@arbitros.ec'),
      ('011480003', 'AAFA', 'Santiago Rafael',   'Crespo Orellana',       '0987003003', 'santiago.crespo@arbitros.ec'),
      ('011480004', 'AAFA', 'Diana Carolina',    'Idrovo Sarmiento',      '0987003004', 'diana.idrovo@arbitros.ec'),
      -- Manabí (AAFM)
      ('131480001', 'AAFM', 'Darwin Gonzalo',    'Intriago Párraga',      '0987004001', 'darwin.intriago@arbitros.ec'),
      ('131480002', 'AAFM', 'Génesis Mayerli',   'Loor Cedeño',           '0987004002', 'genesis.loor@arbitros.ec'),
      ('131480003', 'AAFM', 'Byron Fabricio',    'Mero Zambrano',         '0987004003', 'byron.mero@arbitros.ec'),
      ('131480004', 'AAFM', 'Lisbeth Johana',    'Vera Delgado',          '0987004004', 'lisbeth.vera@arbitros.ec'),
      -- Tungurahua (AAFT)
      ('181480001', 'AAFT', 'Édison Ramiro',     'Acosta Naranjo',        '0987005001', 'edison.acosta@arbitros.ec'),
      ('181480002', 'AAFT', 'María Belén',       'Barrionuevo Lara',      '0987005002', 'maria.barrionuevo@arbitros.ec'),
      ('181480003', 'AAFT', 'Cristian Omar',     'Freire Sánchez',        '0987005003', 'cristian.freire@arbitros.ec'),
      ('181480004', 'AAFT', 'Gabriela Nataly',   'Mayorga Tello',         '0987005004', 'gabriela.mayorga@arbitros.ec'),
      -- Colegio de Árbitros Barriales de Quito (CABQ)
      ('171490001', 'CABQ', 'Néstor Raúl',       'Guerrero Tapia',        '0987006001', 'nestor.guerrero@arbitros.ec'),
      ('171490002', 'CABQ', 'Silvana Elizabeth', 'Herrera Mosquera',      '0987006002', 'silvana.herrera@arbitros.ec'),
      ('171490003', 'CABQ', 'Freddy Leonardo',   'Jácome Ruales',         '0987006003', 'freddy.jacome@arbitros.ec'),
      ('171490004', 'CABQ', 'Karina Mishell',    'Quishpe Anrango',       '0987006004', 'karina.quishpe@arbitros.ec')
    ) AS v(base9, guild_acronyms, first_name, last_name, phone, email)
    LEFT JOIN seed_guilds sg ON sg.acronyms = v.guild_acronyms
    LEFT JOIN public.tab_campeonato_referee_guilds g ON lower(trim(g.description)) = lower(trim(sg.description))
   WHERE NOT EXISTS (
     SELECT 1 FROM public.tab_campeonato_referees r
      WHERE r.identification = pg_temp.ec_cedula(v.base9)
   );

  GET DIAGNOSTICS v_inserted = ROW_COUNT;
  RAISE NOTICE 'Árbitros: % insertado(s).', v_inserted;
END
$referees$;

-- ---------------------------------------------------------------------------------------------------
-- 3. FUTBOLISTAS (padrón global)
-- ---------------------------------------------------------------------------------------------------
DO $players$
DECLARE
  v_inserted integer;
BEGIN
  WITH
    cfg AS (
      SELECT
        COALESCE((SELECT MAX(CAST(SUBSTRING(code FROM 5) AS integer)) FROM public.tab_campeonato_players WHERE code ~ '^JUG-[0-9]+$'), 0) AS last_code,
        COALESCE((SELECT array_agg(id ORDER BY id) FROM public.tab_campeonato_demarcations), ARRAY[]::integer[])            AS demarcations,
        COALESCE((SELECT array_agg(id ORDER BY id) FROM public.tab_campeonato_player_classifications), ARRAY[]::integer[])  AS classifications
    ),
    names AS (
      SELECT
        ARRAY['Carlos','Diego','Jefferson','Luis','Christian','Jonathan','Bryan','Kevin','Edison','Marco','Jorge','Andrés','Xavier','Pablo','Roberto','Gabriel','Mateo','Daniel','Sergio','Fabricio']::text[] AS firsts,
        ARRAY['Morales','Villacís','Quintero','Cevallos','Benítez','Paredes','Alvarado','Reasco','Chávez','Tapia','Guamán','Yépez','Molina','Vásquez','Ochoa','Loor','Proaño','Sánchez','Cajas','Romero']::text[]                 AS lasts1,
        ARRAY['Caicedo','Salazar','Méndez','Zambrano','Espinoza','Guerrero','Pacheco','Delgado','Maldonado','Rivadeneira','Cárdenas','Bastidas','Narváez','Hidalgo','Peñafiel','Macías','Aguirre','Mosquera','Velasteguí','Intriago']::text[] AS lasts2,
        ARRAY['Cotocollao','Carcelén','La Delicia','Calderón','Llano Chico','Pomasqui','Solanda','Chillogallo','Cumbayá','Tumbaco']::text[] AS sectors,
        ARRAY['O+','A+','B+','O-','AB+','A-']::text[]                AS bloods,
        ARRAY['RIGHT','RIGHT','LEFT','BOTH','RIGHT']::text[]         AS foots
    ),
    candidates AS (
      SELECT
        i,
        n.firsts[((i - 1) % 20) + 1]                             AS first_name,
        n.lasts1[((i * 3 - 1) % 20) + 1]                         AS last1,
        n.lasts2[((i * 7 - 1 + 5 * ((i - 1) / 20)) % 20) + 1]    AS last2,
        n.sectors[((i - 1) % 10) + 1]                            AS sector,
        n.bloods[((i - 1) % 6) + 1]                              AS blood_type,
        n.foots[((i - 1) % 5) + 1]                               AS dominant_foot,
        pg_temp.ec_cedula('17147' || LPAD(i::text, 4, '0'))      AS cedula,
        (DATE '1988-01-01' + ((i * 211) % 5200))                 AS birth_date
      FROM generate_series(1, 40) AS i
      CROSS JOIN names n
    ),
    new_rows AS (
      SELECT c.*, ROW_NUMBER() OVER (ORDER BY c.i) AS rn
        FROM candidates c
       WHERE NOT EXISTS (SELECT 1 FROM public.tab_campeonato_players p WHERE p.identification = c.cedula)
    )
  INSERT INTO public.tab_campeonato_players (
    demarcation_id, player_classification_id, pass_owner_type, name, last_name, identification, is_foreigner, code,
    birth_date, age_years, age_months, gender, jersey_number, address, phone, email, blood_type, dominant_foot,
    emergency_contact_name, emergency_contact_phone, is_active, created_name, created_by
  )
  SELECT
    CASE WHEN cardinality(cfg.demarcations)    = 0 THEN NULL ELSE cfg.demarcations[((r.i - 1) % cardinality(cfg.demarcations)) + 1] END,
    CASE WHEN cardinality(cfg.classifications) = 0 THEN NULL ELSE cfg.classifications[((r.i - 1) % cardinality(cfg.classifications)) + 1] END,
    'PLAYER',
    r.first_name,
    r.last1 || ' ' || r.last2,
    r.cedula,
    false,
    'JUG-' || LPAD((cfg.last_code + r.rn)::text, 5, '0'),
    r.birth_date,
    CAST(EXTRACT(YEAR FROM AGE(CURRENT_DATE, r.birth_date)) AS integer),
    CAST(EXTRACT(YEAR FROM AGE(CURRENT_DATE, r.birth_date)) AS integer) * 12 + CAST(EXTRACT(MONTH FROM AGE(CURRENT_DATE, r.birth_date)) AS integer),
    'MALE'::public.tab_campeonato_players_gender_enum,
    ((r.i - 1) % 30) + 1,
    'Quito, sector ' || r.sector,
    '0993' || LPAD(r.i::text, 6, '0'),
    LOWER(TRANSLATE(r.first_name || '.' || r.last1 || r.i::text, 'áéíóúñÁÉÍÓÚÑ', 'aeiounAEIOUN')) || '@futbol.ec',
    r.blood_type,
    r.dominant_foot::public.tab_campeonato_players_dominant_foot_enum,
    'Familiar de ' || r.first_name,
    '0984' || LPAD(r.i::text, 6, '0'),
    true,
    'CARGA SQL CATALOGOS GLOBALES',
    '1'
  FROM new_rows r
  CROSS JOIN cfg;

  GET DIAGNOSTICS v_inserted = ROW_COUNT;
  RAISE NOTICE 'Futbolistas: % insertado(s).', v_inserted;
END
$players$;

-- Resumen de lo cargado por este script (si ya existían, no se vuelven a insertar).
SELECT 'Gremios Arbitrales' AS modulo, count(*) AS registros FROM public.tab_campeonato_referee_guilds WHERE created_name = 'CARGA SQL CATALOGOS GLOBALES'
UNION ALL
SELECT 'Árbitros', count(*) FROM public.tab_campeonato_referees WHERE created_name = 'CARGA SQL CATALOGOS GLOBALES'
UNION ALL
SELECT 'Futbolistas', count(*) FROM public.tab_campeonato_players WHERE created_name = 'CARGA SQL CATALOGOS GLOBALES';

-- APLICA la carga. Para ensayar sin guardar nada, cambia COMMIT por ROLLBACK.
COMMIT;
