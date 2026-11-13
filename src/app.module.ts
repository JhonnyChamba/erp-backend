import { PermissionsTemplatesModule } from './modules/permissions-templates/permissions-templates.module';
import { RolesTemplatesModule } from './modules/roles-templates/roles-templates.module';
import { BranchCompanyModule } from './modules/branch-company/branch-company.module';
import { PlansModulesModule } from './modules/plans-module/plans-module.module';
import { UserCompanyModule } from './modules/user-company/user-company.module';
import { subModulesModule } from './modules/sub-module/sub-module.module';
import { CompanyModule } from './modules/company/company.module';
import { ModuleModule } from './modules/module/module.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { PlansModule } from './modules/plans/plans.module';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { AppService } from './app.service';
import { Module } from '@nestjs/common';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { SubscriptionsModuleModule } from './modules/subscriptions-module/subscriptions-module.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { SalesModule } from './modules/sales/sales.module';
import { ContactsModule } from './modules/contacts/contacts.module';
import { PurchasesModule } from './modules/purchases/purchases.module';
import { ConfigurationModule } from './modules/configuration/configuration.module';
import { StorageModule } from './modules/storage/storage.module';
import { HumanResourcesModule } from './modules/human-resources/human-resources.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        let databaseUrl = config.get<string>('DATABASE_URL')?.trim();
        if (databaseUrl) {
          // Si el usuario dejó los corchetes [MI_CLAVE] de la plantilla de Supabase, quitarlos automáticamente
          databaseUrl = databaseUrl.replace(/^(postgresql?:\/\/[^:]+:)\[([^\]]+)\]@/i, '$1$2@');
        }
        const host = config.get<string>('DATABASE_HOST', 'localhost');
        const useSsl =
          config.get<string>('DATABASE_SSL') === 'true' ||
          host.includes('supabase.co') ||
          host.includes('supabase.com') ||
          Boolean(databaseUrl && databaseUrl.includes('supabase'));

        return {
          type: 'postgres',
          ...(databaseUrl
            ? { url: databaseUrl }
            : {
                host,
                port: Number(config.get<number>('DATABASE_PORT', 5432)),
                username: config.get<string>('DATABASE_USER', 'postgres'),
                password: config.getOrThrow<string>('DATABASE_PASSWORD'),
                database: config.get<string>('DATABASE_NAME', 'db_deskounta'),
              }),
          ssl: useSsl ? { rejectUnauthorized: false } : false,
          retryAttempts: 2,
          retryDelay: 1000,
          autoLoadEntities: true,
          // El esquema se sincroniza con las entidades al iniciar (también en producción); solo se desactiva con DATABASE_SYNCHRONIZE=false.
          synchronize: config.get<string>('DATABASE_SYNCHRONIZE', 'true') === 'true',
        };
      },
    }),
    AuthModule,
    UsersModule,
    CompanyModule,
    BranchCompanyModule,
    UserCompanyModule,
    RolesModule,
    RolesTemplatesModule,
    PermissionsTemplatesModule,
    subModulesModule,
    ModuleModule,
    PlansModule,
    PlansModulesModule,
    SubscriptionsModule,
    SubscriptionsModuleModule,
    InventoryModule,
    SalesModule,
    ContactsModule,
    PurchasesModule,
    ConfigurationModule,
    StorageModule,
    HumanResourcesModule,
    AppointmentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule { }
