const { Client } = require('pg');

const connectionString = 'postgresql://postgres.tnbfcixqgrspmgqrgnag:Deskounta2026@aws-0-us-east-1.pooler.supabase.com:6543/postgres';

async function seed() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log('Conectado a la base de datos Supabase.');

  try {
    const companyId = 6;
    console.log(`Poblando datos de prueba para la empresa ID: ${companyId} (Liga San Jose de Cangahua)...`);

    // 1. Categorías
    console.log('1. Creando Categorías...');
    let catRow = await client.query(`SELECT id FROM tab_campeonato_categories WHERE company_id = $1 AND name = $2 LIMIT 1;`, [companyId, 'Categoría Máxima Senior']);
    let maxCatId;
    if (catRow.rows.length === 0) {
      const ins = await client.query(`
        INSERT INTO tab_campeonato_categories (id, company_id, name, description, code, gender, created_at)
        VALUES (gen_random_uuid(), $1, 'Categoría Máxima Senior', 'División de honor de fútbol 11 senior', 'CAT-MAX', 'MALE', NOW())
        RETURNING id;
      `, [companyId]);
      maxCatId = ins.rows[0].id;
    } else {
      maxCatId = catRow.rows[0].id;
    }

    // 2. Edición de Categoría
    console.log('2. Creando Edición de Categoría...');
    let edRow = await client.query(`SELECT id FROM tab_campeonato_category_editions WHERE company_id = $1 AND name = $2 LIMIT 1;`, [companyId, 'Campeonato Oficial Cangahua 2026']);
    let editionId;
    if (edRow.rows.length === 0) {
      const ins = await client.query(`
        INSERT INTO tab_campeonato_category_editions (id, company_id, category_id, name, description, start_date, end_date, status, created_at)
        VALUES (gen_random_uuid(), $1, $2, 'Campeonato Oficial Cangahua 2026', 'Campeonato anual de fútbol de la parroquia Cangahua', '2026-01-15', '2026-12-15', 'IN_PROGRESS', NOW())
        RETURNING id;
      `, [companyId, maxCatId]);
      editionId = ins.rows[0].id;
    } else {
      editionId = edRow.rows[0].id;
    }

    // 3. Etapas
    console.log('3. Creando Etapas...');
    let stRow = await client.query(`SELECT id FROM tab_campeonato_stages WHERE company_id = $1 AND category_edition_id = $2 LIMIT 1;`, [companyId, editionId]);
    let stageId;
    if (stRow.rows.length === 0) {
      const ins = await client.query(`
        INSERT INTO tab_campeonato_stages (id, company_id, category_edition_id, name, stage_order, format, created_at)
        VALUES (gen_random_uuid(), $1, $2, 'Fase de Clasificación (Todos contra todos)', 1, 'EVERYONE_AGAINST_EVERYONE', NOW())
        RETURNING id;
      `, [companyId, editionId]);
      stageId = ins.rows[0].id;
    } else {
      stageId = stRow.rows[0].id;
    }

    // 4. Escenario / Cancha
    console.log('4. Creando Escenario...');
    let scRow = await client.query(`SELECT id FROM tab_campeonato_scenaries WHERE company_id = $1 LIMIT 1;`, [companyId]);
    let scenaryId;
    if (scRow.rows.length === 0) {
      const ins = await client.query(`
        INSERT INTO tab_campeonato_scenaries (id, company_id, name, location, surface_type, is_active, created_at)
        VALUES (gen_random_uuid(), $1, 'Estadio Central San José de Cangahua', 'Centro Parroquial de Cangahua', 'NATURAL_GRASS', true, NOW())
        RETURNING id;
      `, [companyId]);
      scenaryId = ins.rows[0].id;
    } else {
      scenaryId = scRow.rows[0].id;
    }

    // 5. Demarcaciones
    console.log('5. Creando Demarcaciones...');
    const demDefs = [
      { name: 'Guardameta', code: 'POR', zone: 'GOALKEEPER', order: 1 },
      { name: 'Defensa Central', code: 'DEF', zone: 'DEFENDER', order: 2 },
      { name: 'Mediocampista', code: 'MED', zone: 'MIDFIELDER', order: 3 },
      { name: 'Delantero Centro', code: 'DEL', zone: 'FORWARD', order: 4 },
    ];
    const demIds = {};
    for (const d of demDefs) {
      let r = await client.query(`SELECT id FROM tab_campeonato_demarcations WHERE company_id = $1 AND code = $2 LIMIT 1;`, [companyId, d.code]);
      if (r.rows.length === 0) {
        const ins = await client.query(`
          INSERT INTO tab_campeonato_demarcations (id, company_id, name, code, zone, "order", created_at)
          VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW())
          RETURNING id;
        `, [companyId, d.name, d.code, d.zone, d.order]);
        demIds[d.code] = ins.rows[0].id;
      } else {
        demIds[d.code] = r.rows[0].id;
      }
    }

    // 6. Equipos
    console.log('6. Creando Equipos...');
    const teamsDefs = [
      { name: 'Club Deportivo Cangahua', short: 'CD Cangahua', acronym: 'CDC', color1: '#0055ff', color2: '#ffffff', city: 'Cangahua' },
      { name: 'Sociedad Deportiva San José', short: 'San José', acronym: 'SDSJ', color1: '#dc2626', color2: '#000000', city: 'Cangahua' },
      { name: 'Atlético Juvenil Cangahua', short: 'Atl. Juvenil', acronym: 'AJC', color1: '#16a34a', color2: '#ffffff', city: 'Cangahua' },
      { name: 'Club Real Cangahua F.C.', short: 'Real Cangahua', acronym: 'CRFC', color1: '#eab308', color2: '#000000', city: 'Cangahua' },
      { name: 'Sporting Cangahua', short: 'Sporting', acronym: 'SC', color1: '#0284c7', color2: '#ffffff', city: 'Cangahua' },
      { name: 'Unión Deportiva Cangahua', short: 'Unión Dep.', acronym: 'UDC', color1: '#ea580c', color2: '#000000', city: 'Cangahua' },
    ];

    const teamIds = [];
    const teamRegIds = [];
    for (const t of teamsDefs) {
      let tRow = await client.query(`SELECT id FROM tab_campeonato_teams WHERE company_id = $1 AND name = $2 LIMIT 1;`, [companyId, t.name]);
      let tId;
      if (tRow.rows.length === 0) {
        const ins = await client.query(`
          INSERT INTO tab_campeonato_teams (id, company_id, name, short_name, acronyms, color_1, color_2, city, is_active, created_at)
          VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, true, NOW())
          RETURNING id;
        `, [companyId, t.name, t.short, t.acronym, t.color1, t.color2, t.city]);
        tId = ins.rows[0].id;
      } else {
        tId = tRow.rows[0].id;
      }
      teamIds.push(tId);

      // Inscribir equipo en la edición
      let trRow = await client.query(`SELECT id FROM tab_campeonato_team_registrations WHERE company_id = $1 AND category_edition_id = $2 AND team_id = $3 LIMIT 1;`, [companyId, editionId, tId]);
      let trId;
      if (trRow.rows.length === 0) {
        const ins = await client.query(`
          INSERT INTO tab_campeonato_team_registrations (id, company_id, category_edition_id, team_id, status, payment_status, created_at)
          VALUES (gen_random_uuid(), $1, $2, $3, 'APPROVED', 'PAID', NOW())
          RETURNING id;
        `, [companyId, editionId, tId]);
        trId = ins.rows[0].id;
      } else {
        trId = trRow.rows[0].id;
      }
      teamRegIds.push(trId);
    }

    // 7. Jugadores y Carnets
    console.log('7. Creando Jugadores y Carnets...');
    const playersDefs = [
      { name: 'Jhonny', last: 'Chamba', doc: '1725620247', dorsal: 10, teamIdx: 0, dem: demIds['MED'] },
      { name: 'Mateo', last: 'Quishpe', doc: '1718293041', dorsal: 9, teamIdx: 0, dem: demIds['DEL'] },
      { name: 'Carlos', last: 'Cangahua', doc: '1720394851', dorsal: 1, teamIdx: 0, dem: demIds['POR'] },

      { name: 'Bryan', last: 'Morales', doc: '1728394012', dorsal: 9, teamIdx: 1, dem: demIds['DEL'] },
      { name: 'Luis', last: 'Toapanta', doc: '1719283746', dorsal: 10, teamIdx: 1, dem: demIds['MED'] },

      { name: 'Alex', last: 'Gualoto', doc: '1723491823', dorsal: 7, teamIdx: 2, dem: demIds['DEL'] },
      { name: 'Kevin', last: 'Pilataxi', doc: '1721982734', dorsal: 11, teamIdx: 2, dem: demIds['MED'] },

      { name: 'Diego', last: 'Valenzuela', doc: '1716253490', dorsal: 9, teamIdx: 3, dem: demIds['DEL'] },
      { name: 'Santiago', last: 'Catucuamba', doc: '1724567812', dorsal: 8, teamIdx: 3, dem: demIds['MED'] },

      { name: 'David', last: 'Andrango', doc: '1720192834', dorsal: 10, teamIdx: 4, dem: demIds['MED'] },
      { name: 'Edison', last: 'Faricango', doc: '1727384910', dorsal: 9, teamIdx: 5, dem: demIds['DEL'] },
    ];

    const playerList = [];
    for (const p of playersDefs) {
      let pRow = await client.query(`SELECT id FROM tab_campeonato_players WHERE company_id = $1 AND identification = $2 LIMIT 1;`, [companyId, p.doc]);
      let pId;
      if (pRow.rows.length === 0) {
        const ins = await client.query(`
          INSERT INTO tab_campeonato_players (id, company_id, name, last_name, identification, demarcation_id, jersey_number, gender, is_active, is_foreigner, created_at)
          VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, 'MALE', true, false, NOW())
          RETURNING id;
        `, [companyId, p.name, p.last, p.doc, p.dem, p.dorsal]);
        pId = ins.rows[0].id;
      } else {
        pId = pRow.rows[0].id;
      }
      playerList.push({ id: pId, teamIdx: p.teamIdx, dorsal: p.dorsal });

      // Inscribir jugador en el equipo (carnet)
      const trId = teamRegIds[p.teamIdx];
      let prRow = await client.query(`SELECT id FROM tab_campeonato_player_registrations WHERE company_id = $1 AND team_registration_id = $2 AND player_id = $3 LIMIT 1;`, [companyId, trId, pId]);
      if (prRow.rows.length === 0) {
        await client.query(`
          INSERT INTO tab_campeonato_player_registrations (id, company_id, team_registration_id, player_id, jersey_number, carnet_code, status, is_captain, registration_date, created_at)
          VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, 'ELIGIBLE', $6, NOW(), NOW());
        `, [companyId, trId, pId, p.dorsal, `CARNET-${p.dorsal}-${p.doc.slice(-4)}`, p.dorsal === 10]);
      }
    }

    // 8. Partidos y Resultados (para alimentar la Tabla de Posiciones)
    console.log('8. Creando Partidos y Resultados...');
    const matchesDefs = [
      // Fecha 1 (Finalizados)
      { l: 0, a: 1, r: 1, d: '2026-11-01 10:00:00', hG: 3, aG: 1, st: 'FINISHED' },
      { l: 2, a: 3, r: 1, d: '2026-11-01 12:00:00', hG: 2, aG: 2, st: 'FINISHED' },
      { l: 4, a: 5, r: 1, d: '2026-11-01 14:00:00', hG: 0, aG: 1, st: 'FINISHED' },

      // Fecha 2 (Finalizados)
      { l: 1, a: 2, r: 2, d: '2026-11-08 10:00:00', hG: 2, aG: 0, st: 'FINISHED' },
      { l: 0, a: 4, r: 2, d: '2026-11-08 12:00:00', hG: 2, aG: 1, st: 'FINISHED' },
      { l: 3, a: 5, r: 2, d: '2026-11-08 14:00:00', hG: 3, aG: 1, st: 'FINISHED' },

      // Fecha 3 (Próxima fecha programada)
      { l: 0, a: 3, r: 3, d: '2026-11-22 10:00:00', hG: 0, aG: 0, st: 'SCHEDULED' },
      { l: 1, a: 5, r: 3, d: '2026-11-22 12:00:00', hG: 0, aG: 0, st: 'SCHEDULED' },
      { l: 2, a: 4, r: 3, d: '2026-11-22 14:00:00', hG: 0, aG: 0, st: 'SCHEDULED' },
    ];

    for (const m of matchesDefs) {
      let mRow = await client.query(`
        SELECT id FROM tab_campeonato_matches 
        WHERE company_id = $1 AND stage_id = $2 AND local_team_id = $3 AND away_team_id = $4 LIMIT 1;
      `, [companyId, stageId, teamIds[m.l], teamIds[m.a]]);

      let matchId;
      if (mRow.rows.length === 0) {
        const ins = await client.query(`
          INSERT INTO tab_campeonato_matches (
            id, company_id, stage_id, scenary_id, local_team_id, away_team_id,
            date, round_number, home_goals, away_goals, status, is_walkover, created_at
          )
          VALUES (
            gen_random_uuid(), $1, $2, $3, $4, $5,
            $6, $7, $8, $9, $10, false, NOW()
          )
          RETURNING id;
        `, [companyId, stageId, scenaryId, teamIds[m.l], teamIds[m.a], m.d, m.r, m.hG, m.aG, m.st]);
        matchId = ins.rows[0].id;
      } else {
        matchId = mRow.rows[0].id;
      }

      // 9. Eventos de Gol
      if (m.st === 'FINISHED') {
        const evCount = await client.query(`SELECT COUNT(*) FROM tab_campeonato_match_events WHERE match_id = $1;`, [matchId]);
        if (Number(evCount.rows[0].count) === 0) {
          const localP = playerList.find((p) => p.teamIdx === m.l);
          if (localP && m.hG > 0) {
            for (let g = 0; g < m.hG; g++) {
              await client.query(`
                INSERT INTO tab_campeonato_match_events (
                  id, company_id, match_id, team_id, player_id, event_type, minute, created_at
                )
                VALUES (gen_random_uuid(), $1, $2, $3, $4, 'GOAL', $5, NOW());
              `, [companyId, matchId, teamIds[m.l], localP.id, 15 + g * 25]);
            }
          }

          const awayP = playerList.find((p) => p.teamIdx === m.a);
          if (awayP && m.aG > 0) {
            for (let g = 0; g < m.aG; g++) {
              await client.query(`
                INSERT INTO tab_campeonato_match_events (
                  id, company_id, match_id, team_id, player_id, event_type, minute, created_at
                )
                VALUES (gen_random_uuid(), $1, $2, $3, $4, 'GOAL', $5, NOW());
              `, [companyId, matchId, teamIds[m.a], awayP.id, 20 + g * 30]);
            }
          }
        }
      }
    }

    console.log('✅ ¡Todos los datos de prueba han sido sembrados con éxito en la empresa Liga San Jose de Cangahua!');
  } catch (err) {
    console.error('Error durante la siembra de datos:', err);
  } finally {
    await client.end();
  }
}

seed();
