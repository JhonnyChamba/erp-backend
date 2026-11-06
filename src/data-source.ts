import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

const databaseUrl = process.env.DATABASE_URL;
const host = process.env.DATABASE_HOST || 'localhost';
const useSsl =
  process.env.DATABASE_SSL === 'true' ||
  host.includes('supabase.co') ||
  host.includes('supabase.com') ||
  Boolean(databaseUrl && databaseUrl.includes('supabase'));

export const AppDataSource = new DataSource({
  type: 'postgres',
  ...(databaseUrl
    ? { url: databaseUrl }
    : {
        host,
        port: Number(process.env.DATABASE_PORT) || 6364,
        username: process.env.DATABASE_USER || 'postgres',
        password: process.env.DATABASE_PASSWORD || '2830798aA.',
        database: process.env.DATABASE_NAME || 'db_help_system',
      }),
  ssl: useSsl ? { rejectUnauthorized: false } : false,
  entities: [__dirname + '/**/*.orm-entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: process.env.DATABASE_SYNCHRONIZE === 'true',
});
