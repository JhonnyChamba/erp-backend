import { UsersModule } from 'src/modules/users/users.module';
import { ModuleOrmEntity } from 'src/modules/module/infrastructure/persistence/module.orm-entity';
import { subModulesOrmEntity } from 'src/modules/sub-module/infrastructure/persistence/sub-module.orm-entity';
import { SubscriptionsOrmEntity } from 'src/modules/subscriptions/infrastructure/persistence/subscriptions.orm-entity';
import { RolesOrmEntity, RoleModuleOrmEntity } from 'src/modules/roles/infrastructure/persistence/roles.orm-entity';
import { UserCompanyOrmEntity } from 'src/modules/user-company/infrastructure/persistence/user-company.orm-entity';
import { UsersOrmEntity } from 'src/modules/users/infrastructure/persistence/users.orm-entity';
import { JwtStrategy } from './strategies/jwt/jwt.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AccessControlService } from './access-control.service';
import { PermissionsGuard } from './guards/permissions.guard';
import { CompanyAccessGuard } from './guards/company-access.guard';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Global: AccessControlService y CompanyAccessGuard se usan en los controladores de todos los módulos.
@Global()
@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([
      ModuleOrmEntity,
      subModulesOrmEntity,
      SubscriptionsOrmEntity,
      RolesOrmEntity,
      RoleModuleOrmEntity,
      UserCompanyOrmEntity,
      UsersOrmEntity,
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: (config.get<string>('JWT_EXPIRES_IN') || '15h') as any,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, AccessControlService, PermissionsGuard, CompanyAccessGuard],
  exports: [AuthService, AccessControlService, PermissionsGuard, CompanyAccessGuard],
})

export class AuthModule { }
