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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DATABASE_HOST', 'localhost'),
        port: Number(config.get<number>('DATABASE_PORT', 6364)),
        username: config.get<string>('DATABASE_USER', 'postgres'),
        password: config.get<string>('DATABASE_PASSWORD', '2830798aA.'),
        database: config.get<string>('DATABASE_NAME', 'db_help_system'),
        autoLoadEntities: true,
        synchronize: config.get<string>('DATABASE_SYNCHRONIZE', 'true') === 'true',
      }),
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
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule { }
