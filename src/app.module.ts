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
import { AuthModule } from './auth/auth.module';
import { AppService } from './app.service';
import { Module } from '@nestjs/common';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { SubscriptionsModuleModule } from './modules/subscriptions-module/subscriptions-module.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 6364,
      username: 'postgres',
      password: '2830798aA.',
      database: 'db_help_system',
      autoLoadEntities: true,
      synchronize: true
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
    SubscriptionsModuleModule
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule { }