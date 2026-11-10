import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

const requiredEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error(`Falta la variable de entorno ${name}`);
  return value;
};

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
        port: Number(process.env.DATABASE_PORT) || 5432,
        username: process.env.DATABASE_USER || 'postgres',
        password: requiredEnv('DATABASE_PASSWORD'),
        database: process.env.DATABASE_NAME || 'db_deskounta',
      }),
  ssl: useSsl ? { rejectUnauthorized: false } : false,
  entities: [__dirname + '/**/*.orm-entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: process.env.DATABASE_SYNCHRONIZE === 'true',
});
