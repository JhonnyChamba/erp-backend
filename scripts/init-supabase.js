const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function initSupabase() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl || databaseUrl.includes('[YOUR-PASSWORD]')) {
    console.error(
      '❌ Error: Debes descomentar DATABASE_URL en erp-backend/.env y reemplazar [YOUR-PASSWORD] por tu contraseña real de Supabase.'
    );
    process.exit(1);
  }

  const sqlPath = path.resolve(__dirname, '../../supabase_migration.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log('🔄 Conectando a Supabase...');
    await client.connect();
    console.log('✅ Conexión exitosa a Supabase PostgreSQL.');

    console.log('🚀 Ejecutando migración e inicialización de tablas (supabase_migration.sql)...');
    await client.query(sql);

    const tablesRes = await client.query(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public' AND tablename LIKE 'tab_%'
      ORDER BY tablename;
    `);
    console.log(
      `✅ Tablas vacías creadas y verificadas en Supabase (${tablesRes.rowCount}):`,
      tablesRes.rows.map((r) => r.tablename).join(', ')
    );
  } catch (err) {
    console.error('❌ Error al inicializar Supabase:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

initSupabase();
