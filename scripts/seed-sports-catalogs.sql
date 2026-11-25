-- =====================================================================================================
-- Deskounta ERP · Catálogos deportivos globales (configuración base real)
-- =====================================================================================================
-- Carga los cinco catálogos del menú «Catálogos deportivos»:
--   1. Clasificación de futbolistas   public.tab_campeonato_player_classifications
--   2. Demarcaciones                  public.tab_campeonato_demarcations
--   3. Tipos de competencia           public.tab_campeonato_competition_types
--   4. Vueltas / modalidad            public.tab_campeonato_competition_laps
--   5. Criterios de desempate         public.tab_campeonato_tie_breaker_criteria
--
-- Son catálogos globales: company_id queda en NULL, igual que al crearlos desde la pantalla.
-- Es idempotente: un registro solo se inserta si no existe otro con el mismo código o el mismo nombre.
-- No modifica ni elimina registros existentes.
--
-- Los códigos de tipos de competencia, vueltas y criterios que el sistema siembra al arrancar se conservan
-- tal cual (PLAY_OFF define el formato de eliminación directa de una etapa: no debe cambiarse).
-- =====================================================================================================

BEGIN;

-- -----------------------------------------------------------------------------------------------------
-- 1. Clasificación de futbolistas
--    Los límites (edad, tiempo de residencia, cupos por equipo) se fijan en cada edición de torneo.
-- -----------------------------------------------------------------------------------------------------
INSERT INTO public.tab_campeonato_player_classifications (code, description, observation, is_active, created_name)
SELECT v.code, v.description, v.observation, true, 'Sistema'
  FROM (VALUES
    ('NAT', 'Nativo', 'Nacido en la jurisdicción de la liga (barrio, parroquia o cantón).'),
    ('RES', 'Residente', 'Domiciliado en la jurisdicción de la liga por el tiempo mínimo que exige el reglamento.'),
    ('FOR', 'Foráneo', 'No nació ni reside en la jurisdicción de la liga.'),
    ('EXT', 'Extranjero', 'Futbolista de nacionalidad distinta a la ecuatoriana.'),
    ('JUV', 'Juvenil', 'Futbolista por debajo de la edad límite juvenil que fija el reglamento.'),
    ('SEN', 'Sénior', 'Futbolista que cumple la edad mínima de la categoría sénior.'),
    ('MAS', 'Máster', 'Futbolista que cumple la edad mínima de la categoría máster.'),
    ('REF', 'Refuerzo', 'Futbolista que se incorpora al equipo para reforzarlo en una etapa posterior del torneo.'),
    ('EXP', 'Ex profesional', 'Estuvo registrado en un club del fútbol profesional y ya no lo está.'),
    ('PRO', 'Profesional', 'Registrado actualmente en un club del fútbol profesional.')
  ) AS v(code, description, observation)
 WHERE NOT EXISTS (
   SELECT 1 FROM public.tab_campeonato_player_classifications t
    WHERE upper(t.code) = v.code OR lower(t.description) = lower(v.description)
 );

-- -----------------------------------------------------------------------------------------------------
-- 2. Demarcaciones (max_players = 0: sin límite de jugadores por equipo en esa demarcación)
--    Un INSERT por fila: la zona es un tipo enumerado y el literal debe llegar directo a la columna.
-- -----------------------------------------------------------------------------------------------------
INSERT INTO public.tab_campeonato_demarcations (code, name, zone, "order", max_players, created_name)
SELECT 'ARQ', 'Arquero', 'GOALKEEPER', 1, 0, 'Sistema'
 WHERE NOT EXISTS (SELECT 1 FROM public.tab_campeonato_demarcations t WHERE upper(t.code) = 'ARQ' OR lower(t.name) = lower('Arquero'));

INSERT INTO public.tab_campeonato_demarcations (code, name, zone, "order", max_players, created_name)
SELECT 'DFC', 'Defensa central', 'DEFENDER', 2, 0, 'Sistema'
 WHERE NOT EXISTS (SELECT 1 FROM public.tab_campeonato_demarcations t WHERE upper(t.code) = 'DFC' OR lower(t.name) = lower('Defensa central'));

INSERT INTO public.tab_campeonato_demarcations (code, name, zone, "order", max_players, created_name)
SELECT 'LD', 'Lateral derecho', 'DEFENDER', 3, 0, 'Sistema'
 WHERE NOT EXISTS (SELECT 1 FROM public.tab_campeonato_demarcations t WHERE upper(t.code) = 'LD' OR lower(t.name) = lower('Lateral derecho'));

INSERT INTO public.tab_campeonato_demarcations (code, name, zone, "order", max_players, created_name)
SELECT 'LI', 'Lateral izquierdo', 'DEFENDER', 4, 0, 'Sistema'
 WHERE NOT EXISTS (SELECT 1 FROM public.tab_campeonato_demarcations t WHERE upper(t.code) = 'LI' OR lower(t.name) = lower('Lateral izquierdo'));

INSERT INTO public.tab_campeonato_demarcations (code, name, zone, "order", max_players, created_name)
SELECT 'LIB', 'Líbero', 'DEFENDER', 5, 0, 'Sistema'
 WHERE NOT EXISTS (SELECT 1 FROM public.tab_campeonato_demarcations t WHERE upper(t.code) = 'LIB' OR lower(t.name) = lower('Líbero'));

INSERT INTO public.tab_campeonato_demarcations (code, name, zone, "order", max_players, created_name)
SELECT 'CAD', 'Carrilero derecho', 'DEFENDER', 6, 0, 'Sistema'
 WHERE NOT EXISTS (SELECT 1 FROM public.tab_campeonato_demarcations t WHERE upper(t.code) = 'CAD' OR lower(t.name) = lower('Carrilero derecho'));

INSERT INTO public.tab_campeonato_demarcations (code, name, zone, "order", max_players, created_name)
SELECT 'CAI', 'Carrilero izquierdo', 'DEFENDER', 7, 0, 'Sistema'
 WHERE NOT EXISTS (SELECT 1 FROM public.tab_campeonato_demarcations t WHERE upper(t.code) = 'CAI' OR lower(t.name) = lower('Carrilero izquierdo'));

INSERT INTO public.tab_campeonato_demarcations (code, name, zone, "order", max_players, created_name)
SELECT 'MCD', 'Volante de marca', 'MIDFIELDER', 8, 0, 'Sistema'
 WHERE NOT EXISTS (SELECT 1 FROM public.tab_campeonato_demarcations t WHERE upper(t.code) = 'MCD' OR lower(t.name) = lower('Volante de marca'));

INSERT INTO public.tab_campeonato_demarcations (code, name, zone, "order", max_players, created_name)
SELECT 'MC', 'Volante mixto', 'MIDFIELDER', 9, 0, 'Sistema'
 WHERE NOT EXISTS (SELECT 1 FROM public.tab_campeonato_demarcations t WHERE upper(t.code) = 'MC' OR lower(t.name) = lower('Volante mixto'));

INSERT INTO public.tab_campeonato_demarcations (code, name, zone, "order", max_players, created_name)
SELECT 'MCO', 'Volante de creación', 'MIDFIELDER', 10, 0, 'Sistema'
 WHERE NOT EXISTS (SELECT 1 FROM public.tab_campeonato_demarcations t WHERE upper(t.code) = 'MCO' OR lower(t.name) = lower('Volante de creación'));

INSERT INTO public.tab_campeonato_demarcations (code, name, zone, "order", max_players, created_name)
SELECT 'VD', 'Volante derecho', 'MIDFIELDER', 11, 0, 'Sistema'
 WHERE NOT EXISTS (SELECT 1 FROM public.tab_campeonato_demarcations t WHERE upper(t.code) = 'VD' OR lower(t.name) = lower('Volante derecho'));

INSERT INTO public.tab_campeonato_demarcations (code, name, zone, "order", max_players, created_name)
SELECT 'VI', 'Volante izquierdo', 'MIDFIELDER', 12, 0, 'Sistema'
 WHERE NOT EXISTS (SELECT 1 FROM public.tab_campeonato_demarcations t WHERE upper(t.code) = 'VI' OR lower(t.name) = lower('Volante izquierdo'));

INSERT INTO public.tab_campeonato_demarcations (code, name, zone, "order", max_players, created_name)
SELECT 'ED', 'Extremo derecho', 'FORWARD', 13, 0, 'Sistema'
 WHERE NOT EXISTS (SELECT 1 FROM public.tab_campeonato_demarcations t WHERE upper(t.code) = 'ED' OR lower(t.name) = lower('Extremo derecho'));

INSERT INTO public.tab_campeonato_demarcations (code, name, zone, "order", max_players, created_name)
SELECT 'EI', 'Extremo izquierdo', 'FORWARD', 14, 0, 'Sistema'
 WHERE NOT EXISTS (SELECT 1 FROM public.tab_campeonato_demarcations t WHERE upper(t.code) = 'EI' OR lower(t.name) = lower('Extremo izquierdo'));

INSERT INTO public.tab_campeonato_demarcations (code, name, zone, "order", max_players, created_name)
SELECT 'SD', 'Segundo delantero', 'FORWARD', 15, 0, 'Sistema'
 WHERE NOT EXISTS (SELECT 1 FROM public.tab_campeonato_demarcations t WHERE upper(t.code) = 'SD' OR lower(t.name) = lower('Segundo delantero'));

INSERT INTO public.tab_campeonato_demarcations (code, name, zone, "order", max_players, created_name)
SELECT 'DC', 'Centro delantero', 'FORWARD', 16, 0, 'Sistema'
 WHERE NOT EXISTS (SELECT 1 FROM public.tab_campeonato_demarcations t WHERE upper(t.code) = 'DC' OR lower(t.name) = lower('Centro delantero'));

-- -----------------------------------------------------------------------------------------------------
-- 3. Tipos de competencia
--    Solo PLAY_OFF genera etapas de eliminación directa; los demás generan todos contra todos.
-- -----------------------------------------------------------------------------------------------------
INSERT INTO public.tab_campeonato_competition_types (code, description, observation, is_active, created_name)
SELECT v.code, v.description, v.observation, true, 'Sistema'
  FROM (VALUES
    ('TODOS_VS_TODOS', 'Todos contra Todos (Liga)', 'Encuentros entre todos los equipos por puntos'),
    ('PLAY_OFF', 'Eliminación Directa (Play-offs / Muerte Súbita)', 'Llaves eliminatorias directas (Octavos, Cuartos, Semifinal, Final)'),
    ('GRUPOS_PLAYOFF', 'Fase de Grupos + Clasificatoria a Play-offs', 'Grupos iniciales seguidos de llaves de eliminación'),
    ('CUADRANGULAR', 'Cuadrangular / Triangular Final', 'Ronda final de puntos entre clasificados'),
    ('SISTEMA_SUIZO', 'Sistema Suizo', 'Emparejamiento de equipos con igual puntuación acumulada'),
    ('LIGUILLA', 'Liguilla Final', 'Ronda final de todos contra todos entre los mejores ubicados de la etapa anterior')
  ) AS v(code, description, observation)
 WHERE NOT EXISTS (
   SELECT 1 FROM public.tab_campeonato_competition_types t
    WHERE upper(t.code) = v.code OR lower(t.description) = lower(v.description)
 );

-- -----------------------------------------------------------------------------------------------------
-- 4. Vueltas / modalidad
-- -----------------------------------------------------------------------------------------------------
INSERT INTO public.tab_campeonato_competition_laps (code, description, number_of_laps, observation, is_active, created_name)
SELECT v.code, v.description, v.number_of_laps, v.observation, true, 'Sistema'
  FROM (VALUES
    ('1_VUELTA', 'Solo Ida (1 Vuelta)', 1, 'Una sola rueda de partidos'),
    ('2_VUELTAS', 'Ida y Vuelta (2 Vueltas)', 2, 'Partidos de ida y revancha de vuelta'),
    ('3_VUELTAS', '3 Vueltas (Ida, Vuelta y Neutral)', 3, 'Tres ruedas completas de enfrentamientos'),
    ('4_VUELTAS', '4 Vueltas', 4, 'Cuatro ruedas completas')
  ) AS v(code, description, number_of_laps, observation)
 WHERE NOT EXISTS (
   SELECT 1 FROM public.tab_campeonato_competition_laps t
    WHERE upper(t.code) = v.code OR lower(t.description) = lower(v.description)
 );

-- -----------------------------------------------------------------------------------------------------
-- 5. Criterios de desempate
-- -----------------------------------------------------------------------------------------------------
INSERT INTO public.tab_campeonato_tie_breaker_criteria (code, description, observation, is_active, created_name)
SELECT v.code, v.description, v.observation, true, 'Sistema'
  FROM (VALUES
    ('GOL_DIF', 'Gol Diferencia (GD)', 'Diferencia entre goles a favor y goles en contra'),
    ('GOLES_FAVOR', 'Mayor Número de Goles a Favor (GF)', 'Mayor cantidad de goles anotados'),
    ('RESULTADO_DIRECTO', 'Resultado Particular / Enfrentamiento Directo', 'Resultado del cotejo disputado entre los clubes empatados'),
    ('MENOS_GOLES_CONTRA', 'Menor Número de Goles en Contra (GC)', 'Valla menos batida'),
    ('PARTIDOS_GANADOS', 'Mayor Número de Partidos Ganados (PG)', 'Mayor cantidad de victorias en la etapa'),
    ('GOLES_VISITANTE', 'Mayor Número de Goles como Visitante', 'Goles anotados en condición de visitante en llaves de ida y vuelta'),
    ('FAIR_PLAY', 'Juego Limpio / Fair Play (Menor Puntaje Disciplinario)', 'Menor acumulación de tarjetas rojas y amarillas'),
    ('TIEMPO_EXTRA', 'Tiempo Extra (Alargue)', 'Dos tiempos suplementarios al término del tiempo reglamentario'),
    ('PENALES', 'Definición por Tiros Penales', 'Tanda reglamentaria de penales al término del partido'),
    ('PARTIDO_DESEMPATE', 'Partido Extra de Desempate', 'Encuentro adicional en cancha neutral entre los equipos empatados'),
    ('SORTEO', 'Sorteo Reglamentario', 'Sorteo en sesión oficial de la comisión o gremio arbitral')
  ) AS v(code, description, observation)
 WHERE NOT EXISTS (
   SELECT 1 FROM public.tab_campeonato_tie_breaker_criteria t
    WHERE upper(t.code) = v.code OR lower(t.description) = lower(v.description)
 );

COMMIT;

-- Verificación: cuántos registros quedaron en cada catálogo.
SELECT 'Clasificación de futbolistas' AS catalogo, count(*) AS registros FROM public.tab_campeonato_player_classifications
UNION ALL SELECT 'Demarcaciones', count(*) FROM public.tab_campeonato_demarcations
UNION ALL SELECT 'Tipos de competencia', count(*) FROM public.tab_campeonato_competition_types
UNION ALL SELECT 'Vueltas / modalidad', count(*) FROM public.tab_campeonato_competition_laps
UNION ALL SELECT 'Criterios de desempate', count(*) FROM public.tab_campeonato_tie_breaker_criteria;
