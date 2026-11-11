"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const permissions_templates_module_1 = require("./modules/permissions-templates/permissions-templates.module");
const roles_templates_module_1 = require("./modules/roles-templates/roles-templates.module");
const branch_company_module_1 = require("./modules/branch-company/branch-company.module");
const plans_module_module_1 = require("./modules/plans-module/plans-module.module");
const user_company_module_1 = require("./modules/user-company/user-company.module");
const sub_module_module_1 = require("./modules/sub-module/sub-module.module");
const company_module_1 = require("./modules/company/company.module");
const module_module_1 = require("./modules/module/module.module");
const users_module_1 = require("./modules/users/users.module");
const roles_module_1 = require("./modules/roles/roles.module");
const plans_module_1 = require("./modules/plans/plans.module");
const app_controller_1 = require("./app.controller");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const auth_module_1 = require("./auth/auth.module");
const app_service_1 = require("./app.service");
const common_1 = require("@nestjs/common");
const subscriptions_module_1 = require("./modules/subscriptions/subscriptions.module");
const subscriptions_module_module_1 = require("./modules/subscriptions-module/subscriptions-module.module");
const inventory_module_1 = require("./modules/inventory/inventory.module");
const sales_module_1 = require("./modules/sales/sales.module");
const contacts_module_1 = require("./modules/contacts/contacts.module");
const purchases_module_1 = require("./modules/purchases/purchases.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (config) => {
                    let databaseUrl = config.get('DATABASE_URL')?.trim();
                    if (databaseUrl) {
                        databaseUrl = databaseUrl.replace(/^(postgresql?:\/\/[^:]+:)\[([^\]]+)\]@/i, '$1$2@');
                    }
                    const host = config.get('DATABASE_HOST', 'localhost');
                    const useSsl = config.get('DATABASE_SSL') === 'true' ||
                        host.includes('supabase.co') ||
                        host.includes('supabase.com') ||
                        Boolean(databaseUrl && databaseUrl.includes('supabase'));
                    return {
                        type: 'postgres',
                        ...(databaseUrl
                            ? { url: databaseUrl }
                            : {
                                host,
                                port: Number(config.get('DATABASE_PORT', 5432)),
                                username: config.get('DATABASE_USER', 'postgres'),
                                password: config.getOrThrow('DATABASE_PASSWORD'),
                                database: config.get('DATABASE_NAME', 'db_deskounta'),
                            }),
                        ssl: useSsl ? { rejectUnauthorized: false } : false,
                        retryAttempts: 2,
                        retryDelay: 1000,
                        autoLoadEntities: true,
                        synchronize: config.get('DATABASE_SYNCHRONIZE', 'true') === 'true',
                    };
                },
            }),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            company_module_1.CompanyModule,
            branch_company_module_1.BranchCompanyModule,
            user_company_module_1.UserCompanyModule,
            roles_module_1.RolesModule,
            roles_templates_module_1.RolesTemplatesModule,
            permissions_templates_module_1.PermissionsTemplatesModule,
            sub_module_module_1.subModulesModule,
            module_module_1.ModuleModule,
            plans_module_1.PlansModule,
            plans_module_module_1.PlansModulesModule,
            subscriptions_module_1.SubscriptionsModule,
            subscriptions_module_module_1.SubscriptionsModuleModule,
            inventory_module_1.InventoryModule,
            sales_module_1.SalesModule,
            contacts_module_1.ContactsModule,
            purchases_module_1.PurchasesModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map