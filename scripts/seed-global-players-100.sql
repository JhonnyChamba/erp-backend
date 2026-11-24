-- =====================================================================================================
-- Deskounta ERP · Configuración General del Sistema: 100 Futbolistas en el Padrón Global
-- =====================================================================================================
-- Inserta 100 futbolistas en public.tab_campeonato_players con:
--   * Cédulas ecuatorianas de 10 dígitos 100% válidas (algoritmo oficial Módulo 10 del Registro Civil).
--   * Código secuencial autogenerado JUG-XXXXX (continuando desde el último existente).
--   * Fecha de nacimiento, edad en años (age_years) y edad en meses (age_months) calculadas.
--   * Demarcación (demarcation_id) y Clasificación (player_classification_id) asignadas dinámicamente
--     si existen registros activos en sus respectivos catálogos globales.
--   * Tipo de sangre, pie dominante, teléfono, correo, dirección y contacto de emergencia.
-- Es idempotente: no duplica jugadores si la cédula ya existe en tab_campeonato_players.
-- Para revertir esta carga:
--   DELETE FROM public.tab_campeonato_players WHERE created_name = 'CARGA MASIVA SQL 100';
-- =====================================================================================================

BEGIN;

DO $seed$
DECLARE
  v_base_code_num integer;
  v_demarcations  integer[];
  v_classifs      integer[];
  v_dem_count     integer;
  v_cls_count     integer;
  v_inserted      integer := 0;
  rec             record;
  v_digits        integer[];
  v_coefs         integer[] := ARRAY[2,1,2,1,2,1,2,1,2];
  v_sum           integer;
  v_prod          integer;
  v_check_digit   integer;
  v_cedula        text;
  v_code          text;
  v_age_years     integer;
  v_age_months    integer;
  v_dem_id        integer;
  v_cls_id        integer;
  i               integer;
BEGIN
  -- Obtener el último secuencial JUG-XXXXX existente
  SELECT COALESCE(MAX(CAST(SUBSTRING(code FROM 5) AS INTEGER)), 0)
    INTO v_base_code_num
    FROM public.tab_campeonato_players
   WHERE code ~ '^JUG-[0-9]+$';

  -- Cargar IDs de demarcaciones disponibles (si existen)
  SELECT COALESCE(array_agg(id ORDER BY id), ARRAY[]::integer[])
    INTO v_demarcations
    FROM public.tab_campeonato_demarcations;
  v_dem_count := COALESCE(array_length(v_demarcations, 1), 0);

  -- Cargar IDs de clasificaciones disponibles (si existen)
  SELECT COALESCE(array_agg(id ORDER BY id), ARRAY[]::integer[])
    INTO v_classifs
    FROM public.tab_campeonato_player_classifications;
  v_cls_count := COALESCE(array_length(v_classifs, 1), 0);

  FOR rec IN
    SELECT *
    FROM (VALUES
      (1,  '171450011', 'Carlos Andrés',     'Morales Caicedo',     '1996-03-15', 'O+',  'RIGHT', '0991234001', 'carlos.morales01@futbol.ec',     'Av. Galo Plaza Lasso y De Los Arupos, Quito',      'María Caicedo',      '0987654001', 9),
      (2,  '171450012', 'Diego Fernando',    'Villacís Salazar',    '1998-07-22', 'A+',  'RIGHT', '0991234002', 'diego.villacis02@futbol.ec',     'Calle Carapungo y Giovanni Calles, Calderón',      'Jorge Villacís',     '0987654002', 10),
      (3,  '171450013', 'Jefferson David',   'Quintero Méndez',     '1995-11-08', 'O+',  'LEFT',  '0991234003', 'jefferson.quintero03@futbol.ec', 'Barrio Central, Llano Chico, Quito',               'Rosa Méndez',        '0987654003', 11),
      (4,  '171450014', 'Luis Miguel',       'Cevallos Zambrano',   '2000-01-19', 'B+',  'RIGHT', '0991234004', 'luis.cevallos04@futbol.ec',      'Sector La Delicia, Calle Eloy Alfaro, Quito',      'Pedro Cevallos',     '0987654004', 1),
      (5,  '171450015', 'Christian Gabriel', 'Benítez Espinoza',    '1997-05-30', 'O-',  'BOTH',  '0991234005', 'christian.benitez05@futbol.ec',  'Av. Mariscal Sucre y Mariana de Jesús, Quito',     'Carmen Espinoza',    '0987654005', 7),
      (6,  '171450016', 'Jonathan Alexander','Paredes Guerrero',    '1999-09-12', 'A+',  'RIGHT', '0991234006', 'jonathan.paredes06@futbol.ec',   'Cotocollao, Calle Lizardo Ruiz, Quito',            'Elena Guerrero',     '0987654006', 4),
      (7,  '171450017', 'Bryan Steven',      'Alvarado Pacheco',    '2001-04-25', 'O+',  'LEFT',  '0991234007', 'bryan.alvarado07@futbol.ec',     'Pomasqui, Av. Manuel Córdova Galarza, Quito',      'Héctor Alvarado',    '0987654007', 3),
      (8,  '171450018', 'Kevin Santiago',    'Reasco Delgado',      '2002-12-03', 'AB+', 'RIGHT', '0991234008', 'kevin.reasco08@futbol.ec',       'Carcelén Alto, Calle República Dominicana, Quito', 'Lucía Delgado',      '0987654008', 8),
      (9,  '171450019', 'Edison Patricio',   'Chávez Maldonado',    '1994-06-14', 'O+',  'RIGHT', '0991234009', 'edison.chavez09@futbol.ec',      'Comité del Pueblo, Calle Jorge Garcés, Quito',     'Raúl Chávez',        '0987654009', 5),
      (10, '171450020', 'Marco Antonio',     'Tapia Rivadeneira',   '1993-08-27', 'A-',  'RIGHT', '0991234010', 'marco.tapia10@futbol.ec',        'El Inca, Av. De las Palmeras, Quito',              'Sofía Rivadeneira',  '0987654010', 6),
      (11, '171450021', 'Jorge Luis',        'Guamán Cárdenas',     '1996-02-11', 'O+',  'RIGHT', '0991234011', 'jorge.guaman11@futbol.ec',       'San Isidro del Inca, Calle De los Nogales, Quito', 'Alberto Guamán',     '0987654011', 2),
      (12, '171450022', 'Andrés Sebastián',  'Yépez Bastidas',      '1999-10-17', 'O+',  'LEFT',  '0991234012', 'andres.yepez12@futbol.ec',       'Zámbiza, Barrio San José, Quito',                  'Patricia Bastidas',  '0987654012', 14),
      (13, '171450023', 'Xavier Alejandro',  'Molina Narváez',      '1997-01-29', 'A+',  'RIGHT', '0991234013', 'xavier.molina13@futbol.ec',      'Solanda, Sector 3, Calle José María Alemán',       'Gloria Narváez',     '0987654013', 15),
      (14, '171450024', 'Pablo Esteban',     'Vásquez Hidalgo',     '1995-07-04', 'B+',  'RIGHT', '0991234014', 'pablo.vasquez14@futbol.ec',      'La Magdalena, Av. Rodrigo de Chávez, Quito',       'Fernando Vásquez',   '0987654014', 16),
      (15, '171450025', 'Roberto Carlos',    'Ochoa Peñafiel',      '1992-11-21', 'O+',  'BOTH',  '0991234015', 'roberto.ochoa15@futbol.ec',      'Chimbacalle, Calle Napo y Alpahuasi, Quito',       'Teresa Peñafiel',    '0987654015', 17),
      (16, '171450026', 'Gabriel Alejandro', 'Loor Macías',         '2000-03-09', 'O+',  'RIGHT', '0991234016', 'gabriel.loor16@futbol.ec',       'Chillogallo, Av. Mariscal Sucre, Quito',           'Vicente Loor',       '0987654016', 18),
      (17, '171450027', 'Mateo Nicolás',     'Proaño Aguirre',      '2003-05-16', 'A+',  'LEFT',  '0991234017', 'mateo.proano17@futbol.ec',       'Cumbayá, Av. Interoceánica, Quito',                'Verónica Aguirre',   '0987654017', 19),
      (18, '171450028', 'Daniel Eduardo',    'Sánchez Mosquera',    '1998-08-31', 'O-',  'RIGHT', '0991234018', 'daniel.sanchez18@futbol.ec',     'Tumbaco, Calle Eugenio Espejo, Quito',             'Ricardo Sánchez',    '0987654018', 20),
      (19, '171450029', 'Sergio Fabián',     'Cajas Velasteguí',    '1996-12-12', 'O+',  'RIGHT', '0991234019', 'sergio.cajas19@futbol.ec',       'Conocoto, Av. Ilaló, Quito',                       'Martha Velasteguí',  '0987654019', 21),
      (20, '171450030', 'Alex Darío',        'Bolaños Quiñónez',    '1994-04-02', 'B-',  'RIGHT', '0991234020', 'alex.bolanos20@futbol.ec',       'Sangolquí, Av. General Enríquez, Rumiñahui',       'Ángel Bolaños',      '0987654020', 22),
      (21, '171450031', 'Fabricio Javier',   'Romero Intriago',     '1997-09-23', 'O+',  'RIGHT', '0991234021', 'fabricio.romero21@futbol.ec',    'San Antonio de Pichincha, Av. Equinoccial',        'Blanca Intriago',    '0987654021', 23),
      (22, '171450032', 'Washington René',   'Ayoví Corozo',        '1995-02-18', 'A+',  'LEFT',  '0991234022', 'washington.ayovi22@futbol.ec',   'Carapungo, Etapa B, Calle Río Cayambe, Quito',     'Segundo Ayoví',      '0987654022', 12),
      (23, '171450033', 'Michael Steven',    'Estrada Mina',        '1999-06-07', 'O+',  'RIGHT', '0991234023', 'michael.estrada23@futbol.ec',    'Guamaní, Av. Maldonado, Quito',                    'Francisca Mina',     '0987654023', 9),
      (24, '171450034', 'Enner Leonardo',    'Valencia Preciado',   '1993-10-28', 'O+',  'RIGHT', '0991234024', 'enner.valencia24@futbol.ec',     'Quitumbe, Av. Cóndor Ñan, Quito',                  'Rogelio Valencia',   '0987654024', 13),
      (25, '171450035', 'Gonzalo Sebastián', 'Plata Jiménez',       '2001-11-01', 'A+',  'LEFT',  '0991234025', 'gonzalo.plata25@futbol.ec',      'La Ecuatoriana, Calle Camilo Orejuela, Quito',     'Mónica Jiménez',     '0987654025', 10),
      (26, '171450036', 'Moisés Isaac',      'Caicedo Corozo',      '2002-11-02', 'O+',  'RIGHT', '0991234026', 'moises.caicedo26@futbol.ec',     'San Carlos, Calle Machala y Fernández Salvador',   'Carmen Corozo',      '0987654026', 5),
      (27, '171450037', 'Piero Martín',      'Hincapié Reyna',      '2002-01-09', 'O+',  'LEFT',  '0991234027', 'piero.hincapie27@futbol.ec',     'Ponceano Alto, Av. Diego de Vásquez, Quito',       'Jesús Hincapié',     '0987654027', 3),
      (28, '171450038', 'Pervis Josué',      'Estupiñán Tenorio',   '1998-01-21', 'B+',  'LEFT',  '0991234028', 'pervis.estupinan28@futbol.ec',   'Kennedy, Av. 6 de Diciembre y Ramón Borja',        'Victoria Tenorio',   '0987654028', 6),
      (29, '171450039', 'Ángelo Gabriel',    'Preciado Quiñónez',   '1998-02-18', 'O+',  'RIGHT', '0991234029', 'angelo.preciado29@futbol.ec',    'La Luz, Calle José Bustamante, Quito',             'Julio Preciado',     '0987654029', 2),
      (30, '171450040', 'Félix Eduardo',     'Torres Caicedo',      '1997-01-11', 'A+',  'RIGHT', '0991234030', 'felix.torres30@futbol.ec',       'Monteserrín, Calle De las Azucenas, Quito',        'Narcisa Caicedo',    '0987654030', 4),
      (31, '171450041', 'William Joel',      'Pacho Tenorio',       '2001-10-16', 'O+',  'LEFT',  '0991234031', 'william.pacho31@futbol.ec',      'El Bosque, Av. Edmundo Carvajal, Quito',           'Flor Tenorio',       '0987654031', 4),
      (32, '171450042', 'Hernán Ismael',     'Galíndez Mora',       '1991-03-30', 'A-',  'RIGHT', '0991234032', 'hernan.galindez32@futbol.ec',    'Iñaquito, Av. Amazonas y Naciones Unidas',         'Beatriz Mora',       '0987654032', 1),
      (33, '171450043', 'Alexander',         'Domínguez Carabalí',  '1990-06-05', 'O+',  'RIGHT', '0991234033', 'alexander.dominguez33@futbol.ec','La Concepción, Av. América y Mariana de Jesús',    'Olga Carabalí',      '0987654033', 22),
      (34, '171450044', 'Moisés David',      'Ramírez Pinargote',   '2000-09-09', 'O+',  'RIGHT', '0991234034', 'moises.ramirez34@futbol.ec',     'Amaguaña, Barrio Cuendina, Quito',                 'César Ramírez',      '0987654034', 12),
      (35, '171450045', 'Alan Steven',       'Franco Palma',        '1998-08-21', 'A+',  'RIGHT', '0991234035', 'alan.franco35@futbol.ec',        'Alangasí, Barrio El Tingo, Quito',                 'Rocío Palma',        '0987654035', 21),
      (36, '171450046', 'José Adoni',        'Cifuentes Charcopa',  '1999-03-12', 'O+',  'RIGHT', '0991234036', 'jose.cifuentes36@futbol.ec',     'La Merced, Calle Principal, Quito',                'Gustavo Cifuentes',  '0987654036', 8),
      (37, '171450047', 'Carlos Armando',    'Gruezo Arboleda',     '1995-04-19', 'O+',  'RIGHT', '0991234037', 'carlos.gruezo37@futbol.ec',      'Pintag, Barrio San Alfonso, Quito',                'Carlos Gruezo Sr.',  '0987654037', 5),
      (38, '171450048', 'Jhegson Sebastián', 'Méndez Carabalí',     '1997-04-26', 'B+',  'RIGHT', '0991234038', 'jhegson.mendez38@futbol.ec',     'Puembo, Calle 24 de Mayo, Quito',                  'Alexandra Carabalí', '0987654038', 20),
      (39, '171450049', 'Jeremy Leonel',     'Sarmiento Morante',   '2002-06-16', 'O+',  'BOTH',  '0991234039', 'jeremy.sarmiento39@futbol.ec',   'Pifo, Av. Interoceánica, Quito',                   'Leonel Sarmiento',   '0987654039', 16),
      (40, '171450050', 'Kendry',            'Páez Andrade',        '2006-05-04', 'A+',  'LEFT',  '0991234040', 'kendry.paez40@futbol.ec',        'Tababela, Sector Aeropuerto, Quito',               'Jessica Andrade',    '0987654040', 10),
      (41, '171450051', 'Kevin José',        'Rodríguez Cortez',    '2000-03-04', 'O+',  'RIGHT', '0991234041', 'kevin.rodriguez41@futbol.ec',    'Yaruquí, Barrio El Tejar, Quito',                  'José Rodríguez',     '0987654041', 19),
      (42, '171450052', 'Jordy Josué',       'Caicedo Medina',      '1997-11-18', 'O+',  'RIGHT', '0991234042', 'jordy.caicedo42@futbol.ec',      'Checa, Calle Quito, Distrito Metropolitano',       'Margarita Medina',   '0987654042', 9),
      (43, '171450053', 'Leonardo Javier',   'Campana Romero',      '2000-07-24', 'A+',  'LEFT',  '0991234043', 'leonardo.campana43@futbol.ec',   'El Quinche, Calle Bolívar, Quito',                 'Pablo Campana',      '0987654043', 9),
      (44, '171450054', 'Ángel Israel',      'Mena Delgado',        '1991-01-21', 'O+',  'LEFT',  '0991234044', 'angel.mena44@futbol.ec',         'Guayllabamba, Av. Simón Bolívar, Quito',           'Ángela Delgado',     '0987654044', 15),
      (45, '171450055', 'Romario Andrés',    'Ibarra Mina',         '1994-09-24', 'O+',  'RIGHT', '0991234045', 'romario.ibarra45@futbol.ec',     'Calacalí, Calle Sucre, Quito',                     'Renato Ibarra',      '0987654045', 11),
      (46, '171450056', 'Renato',            'Ibarra Mina',         '1991-01-20', 'O+',  'RIGHT', '0991234046', 'renato.ibarra46@futbol.ec',      'Nono, Barrio Central, Quito',                      'Segundo Ibarra',     '0987654046', 7),
      (47, '171450057', 'Robert',            'Arboleda Escobar',    '1991-10-22', 'A+',  'RIGHT', '0991234047', 'robert.arboleda47@futbol.ec',    'Nanegalito, Vía Los Bancos, Pichincha',            'Gladys Escobar',     '0987654047', 4),
      (48, '171450058', 'Xavier',            'Arreaga Bermello',    '1994-09-28', 'O+',  'RIGHT', '0991234048', 'xavier.arreaga48@futbol.ec',     'Gualea, Sector Centro, Pichincha',                 'Fabiola Bermello',   '0987654048', 3),
      (49, '171450059', 'Diego',             'Palacios Espinoza',   '1999-07-12', 'O-',  'LEFT',  '0991234049', 'diego.palacios49@futbol.ec',     'Pacto, Barrio San Francisco, Pichincha',           'Juana Espinoza',     '0987654049', 6),
      (50, '171450060', 'Byron David',       'Castillo Segura',     '1998-11-10', 'O+',  'RIGHT', '0991234050', 'byron.castillo50@futbol.ec',     'Pedro Vicente Maldonado, Av. Principal',           'Luisa Segura',       '0987654050', 2),
      (51, '171450061', 'Pedro Pablo',       'Ortiz Angulo',        '1990-02-19', 'A+',  'RIGHT', '0991234051', 'pedro.ortiz51@futbol.ec',        'Puerto Quito, Barrio La Sexta',                    'Mariana Angulo',     '0987654051', 1),
      (52, '171450062', 'Javier',            'Burrai Salvatierra',  '1990-10-09', 'O+',  'RIGHT', '0991234052', 'javier.burrai52@futbol.ec',      'San Miguel del Común, Calderón, Quito',            'Carlos Salvatierra', '0987654052', 22),
      (53, '171450063', 'Damián Rodrigo',    'Díaz Ferreira',       '1991-05-01', 'B+',  'RIGHT', '0991234053', 'damian.diaz53@futbol.ec',        'Santa Anita, Llano Chico, Quito',                  'Laura Ferreira',     '0987654053', 10),
      (54, '171450064', 'Ezequiel',          'Piovi Pereyra',       '1992-08-20', 'A+',  'RIGHT', '0991234054', 'ezequiel.piovi54@futbol.ec',     'Bellavista de Calderón, Calle Quitus, Quito',      'Martín Piovi',       '0987654054', 18),
      (55, '171450065', 'Alexander',         'Alvarado Carcelén',   '1999-04-21', 'O+',  'RIGHT', '0991234055', 'alexander.alvarado55@futbol.ec', 'Zabala, Calle Panamericana Norte, Calderón',       'Rosa Carcelén',      '0987654055', 8),
      (56, '171450066', 'Jhojan Esmaides',   'Julio Palacios',      '1998-02-11', 'O+',  'RIGHT', '0991234056', 'jhojan.julio56@futbol.ec',       'San Juan de Calderón, Calle Pío XII, Quito',       'Anderson Julio',     '0987654056', 11),
      (57, '171450067', 'Anderson',          'Julio Palacios',      '1996-05-31', 'O+',  'RIGHT', '0991234057', 'anderson.julio57@futbol.ec',     'Marianitas de Calderón, Calle Principal, Quito',   'Jhojan Julio',       '0987654057', 7),
      (58, '171450068', 'Lisandro',          'Alzugaray Domínguez', '1990-04-17', 'A+',  'LEFT',  '0991234058', 'lisandro.alzugaray58@futbol.ec', 'Oyacoto, Vía Panamericana Norte, Quito',           'Sofía Domínguez',    '0987654058', 17),
      (59, '171450069', 'José',              'Quintero Ordóñez',    '1990-06-20', 'O+',  'RIGHT', '0991234059', 'jose.quintero59@futbol.ec',      'Llano Grande, Calle García Moreno, Quito',         'Teresa Ordóñez',     '0987654059', 14),
      (60, '171450070', 'Leonel',            'Quiñónez Padilla',    '1993-07-03', 'O+',  'LEFT',  '0991234060', 'leonel.quinonez60@futbol.ec',    'Cocotog, Barrio San Miguel, Quito',                'Luis Quiñónez',      '0987654060', 33),
      (61, '171450071', 'Ricardo',           'Adéagbo Vernet',      '1990-05-21', 'O+',  'RIGHT', '0991234061', 'ricardo.ade61@futbol.ec',        'Gualo, Barrio La Dolorosa, Llano Chico',           'Marie Vernet',       '0987654061', 4),
      (62, '171450072', 'Facundo',           'Rodríguez Aguilera',  '2000-02-26', 'A+',  'LEFT',  '0991234062', 'facundo.rodriguez62@futbol.ec',  'Carretas, Sector Norte, Quito',                    'Hugo Rodríguez',     '0987654062', 24),
      (63, '171450073', 'Sebastián',         'González Baquero',    '2003-06-06', 'O+',  'RIGHT', '0991234063', 'sebastian.gonzalez63@futbol.ec', 'Bicentenario, Av. Amazonas, Quito',                'Claudia Baquero',    '0987654063', 21),
      (64, '171450074', 'Óscar Steven',      'Zambrano Preciado',   '2004-04-20', 'O+',  'RIGHT', '0991234064', 'oscar.zambrano64@futbol.ec',     'La Florida, Av. Occidental, Quito',                'Óscar Zambrano Sr.', '0987654064', 5),
      (65, '171450075', 'Nilson David',      'Angulo Ramírez',      '2003-06-19', 'O+',  'RIGHT', '0991234065', 'nilson.angulo65@futbol.ec',      'San Antonio, Barrio La Merced, Quito',             'David Angulo',       '0987654065', 32),
      (66, '171450076', 'Joel',              'Ordóñez Guerrero',    '2004-04-21', 'A+',  'RIGHT', '0991234066', 'joel.ordonez66@futbol.ec',       'Pomasqui, Urbanización La Pampa, Quito',           'Clara Guerrero',     '0987654066', 29),
      (67, '171450077', 'Patrickson',        'Delgado Villa',       '2003-10-17', 'O+',  'RIGHT', '0991234067', 'patrickson.delgado67@futbol.ec', 'San Rafael, Valle de los Chillos',                 'Amparo Villa',       '0987654067', 8),
      (68, '171450078', 'Yaimar Abel',       'Medina Ortiz',        '2004-11-05', 'O+',  'LEFT',  '0991234068', 'yaimar.medina68@futbol.ec',      'Fajardo, Av. General Rumiñahui',                   'Abel Medina',        '0987654068', 15),
      (69, '171450079', 'Justin',            'Cuero Palacio',       '2004-04-01', 'B+',  'RIGHT', '0991234069', 'justin.cuero69@futbol.ec',       'Capelo, Calle Los Sauces, Rumiñahui',              'Estela Palacio',     '0987654069', 9),
      (70, '171450080', 'Allen',             'Obando Ayoví',        '2006-06-13', 'O+',  'RIGHT', '0991234070', 'allen.obando70@futbol.ec',       'Uyumbicho, Barrio Central, Mejía',                 'Lourdes Ayoví',      '0987654070', 19),
      (71, '171450081', 'Keny',              'Arroyo Alvarado',     '2006-02-14', 'A+',  'LEFT',  '0991234071', 'keny.arroyo71@futbol.ec',        'Tambillo, Panamericana Sur, Mejía',                'Marcos Arroyo',      '0987654071', 7),
      (72, '171450082', 'Junior',            'Sornoza Moreira',     '1994-01-28', 'O+',  'RIGHT', '0991234072', 'junior.sornoza72@futbol.ec',     'Machachi, Av. Amazonas, Mejía',                    'Fátima Moreira',     '0987654072', 10),
      (73, '171450083', 'Joao Joshimar',     'Rojas López',         '1997-08-16', 'A+',  'RIGHT', '0991234073', 'joao.rojas73@futbol.ec',         'Aloasí, Sector Estación, Mejía',                   'Marisol López',      '0987654073', 11),
      (74, '171450084', 'Fernando',          'Gaibor Orellana',     '1991-10-08', 'O+',  'RIGHT', '0991234074', 'fernando.gaibor74@futbol.ec',    'Cutuglagua, Barrio Santo Domingo, Mejía',          'Silvia Orellana',    '0987654074', 5),
      (75, '171450085', 'Janner',            'Corozo Alman',        '1995-09-08', 'O+',  'RIGHT', '0991234075', 'janner.corozo75@futbol.ec',      'Turubamba, Av. Teniente Hugo Ortiz, Quito',        'Esperanza Alman',    '0987654075', 13),
      (76, '171450086', 'Adonis',            'Preciado Quintero',   '1997-03-23', 'B+',  'RIGHT', '0991234076', 'adonis.preciado76@futbol.ec',    'San Bartolo, Av. Pedro Vicente Maldonado',         'Doris Quintero',     '0987654076', 17),
      (77, '171450087', 'Aníbal',            'Chalá Ayoví',         '1996-05-09', 'O+',  'LEFT',  '0991234077', 'anibal.chala77@futbol.ec',       'El Recreo, Calle Moraspungo, Quito',               'Cleotilde Ayoví',    '0987654077', 6),
      (78, '171450088', 'Luca',              'Sosa Acosta',         '1994-06-11', 'A-',  'LEFT',  '0991234078', 'luca.sosa78@futbol.ec',          'La Villaflora, Av. Alonso de Angulo, Quito',       'Valeria Acosta',     '0987654078', 3),
      (79, '171450089', 'Jesús',             'Trindade Flores',     '1993-07-10', 'O+',  'RIGHT', '0991234079', 'jesus.trindade79@futbol.ec',     'El Calzado, Calle Pinllopata, Quito',              'Camila Flores',      '0987654079', 5),
      (80, '171450090', 'Leonai',            'Souza de Almeida',    '1995-04-28', 'O+',  'RIGHT', '0991234080', 'leonai.souza80@futbol.ec',       'Santa Rita, Av. Cardenal de la Torre, Quito',      'Helena Almeida',     '0987654080', 8),
      (81, '171450091', 'Octavio',           'Rivero Falero',       '1992-01-24', 'A+',  'RIGHT', '0991234081', 'octavio.rivero81@futbol.ec',     'La Ferroviaria Alta, Calle Adrián Navarro',        'Luciana Falero',     '0987654081', 9),
      (82, '171450092', 'Pedro',             'Vite Uca',            '2002-03-09', 'O+',  'LEFT',  '0991234082', 'pedro.vite82@futbol.ec',         'Chiriyacu, Calle Gualberto Pérez, Quito',          'Mónica Uca',         '0987654082', 10),
      (83, '171450093', 'John',              'Yeboah Zamora',       '2000-06-23', 'O+',  'LEFT',  '0991234083', 'john.yeboah83@futbol.ec',        'La Argelia, Calle Río Prieto, Quito',              'Pilar Zamora',       '0987654083', 11),
      (84, '171450094', 'Cristian',          'Ramírez Zambrano',    '1994-08-12', 'O+',  'LEFT',  '0991234084', 'cristian.ramirez84@futbol.ec',   'Luluncoto, Av. Napo, Quito',                       'Sonia Zambrano',     '0987654084', 6),
      (85, '171450095', 'Jordy',             'Alcívar Macías',      '1999-08-05', 'A+',  'RIGHT', '0991234085', 'jordy.alcivar85@futbol.ec',      'San Sebastián, Calle Rocafuerte, Quito',           'Miriam Macías',      '0987654085', 5),
      (86, '171450096', 'Gonzalo',           'Mastrani Reyes',      '1993-04-28', 'O+',  'LEFT',  '0991234086', 'gonzalo.mastrani86@futbol.ec',   'El Tejar, Calle Mejía, Centro Histórico',          'Andrea Reyes',       '0987654086', 9),
      (87, '171450097', 'Luis Fernando',     'León Bermeo',         '1993-04-11', 'O+',  'RIGHT', '0991234087', 'luis.leon87@futbol.ec',          'San Juan, Calle Guatemala, Quito',                 'Norma Bermeo',       '0987654087', 4),
      (88, '171450098', 'Facundo',           'Castelli Ledesma',    '1995-02-18', 'B+',  'RIGHT', '0991234088', 'facundo.castelli88@futbol.ec',   'Miraflores, Av. Universitaria, Quito',             'Carla Ledesma',      '0987654088', 19),
      (89, '171450099', 'Marcelo',           'Meli Sánchez',        '1992-06-20', 'A+',  'RIGHT', '0991234089', 'marcelo.meli89@futbol.ec',       'La Gasca, Av. Marchena, Quito',                    'Natalia Sánchez',    '0987654089', 8),
      (90, '171450100', 'Pedro',             'Ortíz Villavicencio', '1991-02-19', 'O+',  'RIGHT', '0991234090', 'pedro.ortiz90@futbol.ec',        'Pambachupa, Av. La Gasca, Quito',                  'Elena Villavicencio','0987654090', 1),
      (91, '171450101', 'Cristhian',         'Noboa Tello',         '1990-04-09', 'O+',  'RIGHT', '0991234091', 'cristhian.noboa91@futbol.ec',    'Belisario Quevedo, Calle Cuero y Caicedo',         'Marlene Tello',      '0987654091', 8),
      (92, '171450102', 'Fidel',             'Martínez Tenorio',    '1990-02-15', 'A+',  'LEFT',  '0991234092', 'fidel.martinez92@futbol.ec',     'Rumipamba, Av. Atahualpa, Quito',                  'Fidel Martínez Sr.', '0987654092', 11),
      (93, '171450103', 'Miller',            'Bolaños Reasco',      '1990-06-01', 'O+',  'RIGHT', '0991234093', 'miller.bolanos93@futbol.ec',     'La Carolina, Av. República del Salvador',          'Letty Reasco',       '0987654093', 23),
      (94, '171450104', 'Dixon',             'Arroyo Espinoza',     '1992-06-01', 'O+',  'RIGHT', '0991234094', 'dixon.arroyo94@futbol.ec',       'Bellavista, Calle Bosmediano, Quito',              'Nelly Espinoza',     '0987654094', 5),
      (95, '171450105', 'Gabriel',           'Cortez Casierra',     '1995-10-10', 'A+',  'RIGHT', '0991234095', 'gabriel.cortez95@futbol.ec',     'Batán Alto, Calle Portugal, Quito',                'Yolanda Casierra',   '0987654095', 10),
      (96, '171450106', 'Michael',           'Carcelén Caicedo',    '1997-04-14', 'O+',  'RIGHT', '0991234096', 'michael.carcelen96@futbol.ec',   'El Dorado, Calle Sodiro, Quito',                   'Julia Caicedo',      '0987654096', 16),
      (97, '171450107', 'Ronnie',            'Carrillo Morales',    '1996-09-08', 'O+',  'RIGHT', '0991234097', 'ronnie.carrillo97@futbol.ec',    'La Vicentina, Calle Ladrón de Guevara',            'Manuel Carrillo',    '0987654097', 9),
      (98, '171450108', 'Jonathan',          'Borja Colorado',      '1994-04-05', 'B+',  'RIGHT', '0991234098', 'jonathan.borja98@futbol.ec',     'La Floresta, Av. Coruña y Toledo, Quito',          'Cecilia Colorado',   '0987654098', 17),
      (99, '171450109', 'Bryan',             'De Jesús Pabón',      '1995-02-10', 'O+',  'RIGHT', '0991234099', 'bryan.dejesus99@futbol.ec',      'Guápulo, Camino de Orellana, Quito',               'Marlon De Jesús',    '0987654099', 19),
      (100,'171450110', 'Alejandro',         'Cabeza Jiménez',      '1997-03-11', 'A+',  'RIGHT', '0991234100', 'alejandro.cabeza100@futbol.ec',  'San Blas, Calle Guayaquil, Quito',                 'Lorena Jiménez',     '0987654100', 9)
    ) AS t(idx, base9, first_name, last_name, birth_date_str, blood_type, dominant_foot, phone, email, address, emerg_name, emerg_phone, jersey_num)
  LOOP
    -- Calcular dígito verificador oficial Módulo 10 para los 9 primeros dígitos (base9)
    v_sum := 0;
    FOR i IN 1..9 LOOP
      v_prod := CAST(SUBSTRING(rec.base9 FROM i FOR 1) AS INTEGER) * v_coefs[i];
      IF v_prod >= 10 THEN
        v_prod := v_prod - 9;
      END IF;
      v_sum := v_sum + v_prod;
    END LOOP;

    IF (v_sum % 10) = 0 THEN
      v_check_digit := 0;
    ELSE
      v_check_digit := 10 - (v_sum % 10);
    END IF;

    v_cedula := rec.base9 || v_check_digit::text;

    -- Verificar que no exista ya esa cédula en el padrón global
    IF NOT EXISTS (SELECT 1 FROM public.tab_campeonato_players p WHERE p.identification = v_cedula) THEN
      v_base_code_num := v_base_code_num + 1;
      v_code := 'JUG-' || LPAD(v_base_code_num::text, 5, '0');

      -- Calcular edad en años y meses respecto a la fecha actual
      v_age_years := CAST(EXTRACT(YEAR FROM AGE(CURRENT_DATE, rec.birth_date_str::date)) AS INTEGER);
      v_age_months := (v_age_years * 12) + CAST(EXTRACT(MONTH FROM AGE(CURRENT_DATE, rec.birth_date_str::date)) AS INTEGER);

      -- Asignar demarcación y clasificación de forma rotativa si existen en la BD
      IF v_dem_count > 0 THEN
        v_dem_id := v_demarcations[((rec.idx - 1) % v_dem_count) + 1];
      ELSE
        v_dem_id := NULL;
      END IF;

      IF v_cls_count > 0 THEN
        v_cls_id := v_classifs[((rec.idx - 1) % v_cls_count) + 1];
      ELSE
        v_cls_id := NULL;
      END IF;

      INSERT INTO public.tab_campeonato_players (
        demarcation_id,
        player_classification_id,
        pass_owner_type,
        name,
        last_name,
        identification,
        is_foreigner,
        code,
        birth_date,
        age_years,
        age_months,
        gender,
        jersey_number,
        address,
        phone,
        email,
        blood_type,
        dominant_foot,
        emergency_contact_name,
        emergency_contact_phone,
        is_active,
        created_name,
        created_by
      ) VALUES (
        v_dem_id,
        v_cls_id,
        'PLAYER',
        rec.first_name,
        rec.last_name,
        v_cedula,
        false,
        v_code,
        rec.birth_date_str::date,
        v_age_years,
        v_age_months,
        'MALE',
        rec.jersey_num,
        rec.address,
        rec.phone,
        rec.email,
        rec.blood_type,
        rec.dominant_foot::public.tab_campeonato_players_dominant_foot_enum,
        rec.emerg_name,
        rec.emerg_phone,
        true,
        'CARGA MASIVA SQL 100',
        '1'
      );

      v_inserted := v_inserted + 1;
    END IF;
  END LOOP;

  RAISE NOTICE 'Padrón Global de Futbolistas: % futbolistas insertados exitosamente (% ya existían).', v_inserted, 100 - v_inserted;
END
$seed$;

COMMIT;
