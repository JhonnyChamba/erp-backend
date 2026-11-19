-- =====================================================================================================
-- Deskounta ERP · Campeonato: 20 equipos de prueba para la empresa con id 1 (Llano Chico)
-- =====================================================================================================
-- Inserta 20 equipos ficticios en tab_campeonato_teams para la empresa 1. Se puede ejecutar más de una vez:
-- no vuelve a insertar un equipo cuyo nombre ya exista en esa empresa. Si la empresa 1 no existe, no inserta nada.
-- Los equipos quedan activos, sin categoría, logo, correo ni teléfono (se completan desde la pantalla de Equipos).
-- Para borrarlos: DELETE FROM tab_campeonato_teams WHERE company_id = 1 AND created_name = 'CARGA DE PRUEBA';
-- =====================================================================================================

BEGIN;

DO $seed$
DECLARE
  c_company_id constant integer := 1;
  v_company    text;
  v_inserted   integer;
BEGIN
  SELECT COALESCE(to_jsonb(c) ->> 'nombre_comercial', to_jsonb(c) ->> 'razon_social', to_jsonb(c) ->> 'name', 'sin nombre')
    INTO v_company
    FROM public.tab_company c
   WHERE c.id = c_company_id;

  IF v_company IS NULL THEN
    RAISE EXCEPTION 'No existe la empresa con id %; no se insertó nada.', c_company_id;
  END IF;

  INSERT INTO public.tab_campeonato_teams
    (company_id, name, short_name, acronyms, color_1, color_2, color_alternate, date_of_foundation, city, neighborhood, current_season_year, is_active, created_name)
  SELECT c_company_id, t.name, t.short_name, t.acronyms, t.color_1, t.color_2, t.color_alternate, t.date_of_foundation::date, 'Quito', t.neighborhood, '2026', true, 'CARGA DE PRUEBA'
    FROM (VALUES
      ('Club Deportivo Halcones del Llano', 'Halcones',        'CDH', '#1E3A8A', '#FFFFFF', '#F59E0B', '1998-03-14', 'La Delicia'),
      ('Atlético San Miguel',               'San Miguel',      'ASM', '#B91C1C', '#FFFFFF', '#111827', '2001-07-22', 'San Miguel'),
      ('Juventud Unida',                    'Juv. Unida',      'JUN', '#15803D', '#FACC15', '#FFFFFF', '1995-11-05', 'Central'),
      ('Real Gualo FC',                     'Real Gualo',      'RGF', '#7C3AED', '#FFFFFF', '#111827', '2008-02-17', 'Gualo'),
      ('Deportivo La Dolorosa',             'La Dolorosa',     'DLD', '#0EA5E9', '#FFFFFF', '#1E293B', '1989-09-30', 'La Dolorosa'),
      ('Independiente del Valle Chico',     'Independiente',   'IVC', '#111827', '#EF4444', '#FFFFFF', '2003-05-11', 'El Valle'),
      ('Sporting Cocotog',                  'Sporting',        'SPC', '#F97316', '#111827', '#FFFFFF', '2010-08-08', 'Cocotog'),
      ('Unión Central',                     'U. Central',      'UNC', '#FACC15', '#1E3A8A', '#FFFFFF', '1992-01-25', 'Central'),
      ('Los Andes SC',                      'Los Andes',       'LAS', '#FFFFFF', '#15803D', '#111827', '1986-06-19', 'Los Andes'),
      ('Estrella Roja del Norte',           'Estrella Roja',   'ERN', '#DC2626', '#FACC15', '#FFFFFF', '1999-12-03', 'El Carmen'),
      ('Cóndores de San José',              'Cóndores',        'CSJ', '#334155', '#FFFFFF', '#F97316', '2005-04-27', 'San José'),
      ('Deportivo Bellavista',              'Bellavista',      'DBV', '#0F766E', '#FFFFFF', '#FACC15', '1997-10-12', 'Bellavista'),
      ('Atlético Los Pinos',                'Los Pinos',       'ALP', '#166534', '#FFFFFF', '#111827', '2012-03-09', 'Los Pinos'),
      ('Nueva Generación FC',               'Nueva Gen.',      'NGF', '#2563EB', '#F97316', '#FFFFFF', '2015-09-18', 'La Delicia'),
      ('Club Social El Progreso',           'El Progreso',     'CEP', '#9333EA', '#FACC15', '#FFFFFF', '1990-02-28', 'El Progreso'),
      ('Titanes del Llano',                 'Titanes',         'TDL', '#1F2937', '#38BDF8', '#FFFFFF', '2007-11-21', 'San Miguel'),
      ('Rayo Carretas',                     'Rayo',            'RCA', '#EAB308', '#111827', '#FFFFFF', '2000-06-06', 'Carretas'),
      ('Deportivo Santa Ana',               'Santa Ana',       'DSA', '#BE123C', '#FFFFFF', '#1E3A8A', '1994-08-15', 'Santa Ana'),
      ('Leones de Zámbiza',                 'Leones',          'LDZ', '#C2410C', '#111827', '#FFFFFF', '2002-01-13', 'Zámbiza'),
      ('Fuerza Amarilla del Barrio',        'Fuerza Amarilla', 'FAB', '#FDE047', '#15803D', '#111827', '2018-05-20', 'El Carmen')
    ) AS t (name, short_name, acronyms, color_1, color_2, color_alternate, date_of_foundation, neighborhood)
   WHERE NOT EXISTS (
     SELECT 1 FROM public.tab_campeonato_teams e WHERE e.company_id = c_company_id AND lower(e.name) = lower(t.name)
   );

  GET DIAGNOSTICS v_inserted = ROW_COUNT;
  RAISE NOTICE 'Empresa % (%): % equipos insertados, % ya existían.', c_company_id, v_company, v_inserted, 20 - v_inserted;
END
$seed$;

COMMIT;
