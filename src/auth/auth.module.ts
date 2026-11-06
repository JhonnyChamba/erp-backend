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
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

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
        secret: config.get<string>('JWT_SECRET', 'super_secret_key_deskounta_erp_2026'),
        signOptions: {
          expiresIn: config.get<string>('JWT_EXPIRES_IN', '1d') as any,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, AccessControlService, PermissionsGuard],
  exports: [AuthService, AccessControlService, PermissionsGuard],
})

export class AuthModule { }
