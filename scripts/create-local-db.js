const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function createLocalDb() {
  const host = process.env.DATABASE_HOST || 'localhost';
  const port = Number(process.env.DATABASE_PORT) || 5432;
  const user = process.env.DATABASE_USER || 'postgres';
  const password = process.env.DATABASE_PASSWORD;
  if (!password) throw new Error('Falta la variable de entorno DATABASE_PASSWORD (defínela en erp-backend/.env).');
  const dbName = process.env.DATABASE_NAME || 'db_deskounta';

  // 1. Conectar a la base por defecto 'postgres' para crear db_deskounta si no existe
  const adminClient = new Client({ host, port, user, password, database: 'postgres' });
  try {
    await adminClient.connect();
    const res = await adminClient.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
    if (res.rowCount === 0) {
      await adminClient.query(`CREATE DATABASE "${dbName}"`);
      console.log(`✅ Base de datos "${dbName}" creada exitosamente.`);
    } else {
      console.log(`ℹ️ La base de datos "${dbName}" ya existe.`);
    }
  } finally {
    await adminClient.end();
  }

  // 2. Conectar a db_deskounta y crear las tablas vacías
  const sqlPath = path.resolve(__dirname, '../../supabase_migration.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  const dbClient = new Client({ host, port, user, password, database: dbName });

  try {
    await dbClient.connect();
    await dbClient.query(sql);
    const tablesRes = await dbClient.query(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public' AND tablename LIKE 'tab_%'
      ORDER BY tablename;
    `);
    console.log(
      `✅ Tablas vacías listas en "${dbName}" (${tablesRes.rowCount}):`,
      tablesRes.rows.map((r) => r.tablename).join(', ')
    );
  } finally {
    await dbClient.end();
  }
}

createLocalDb().catch((err) => {
  console.error('❌ Error creando/inicializando la base local:', err.message);
  process.exit(1);
});

