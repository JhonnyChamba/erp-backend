import { UserCompanyOrmEntity } from './modules/user-company/infrastructure/persistence/user-company.orm-entity';
import { CompanyOrmEntity } from './modules/company/infrastructure/persistence/company.orm-entity';
import { UsersOrmEntity } from './modules/users/infrastructure/persistence/users.orm-entity';
import { Roles } from './modules/roles/domain/entities/roles.entity';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: Number(process.env.DATABASE_PORT) || 5432,  // Aquí toma la variable y la convierte a número
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [CompanyOrmEntity, UserCompanyOrmEntity, Roles, UsersOrmEntity],
  migrations: ['src/migrations/*.ts'],
  synchronize: true, // importante que esté false para usar migraciones
});
