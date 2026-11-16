import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AccessControlService } from '../access-control.service';
export declare const REQUIRE_ACCESS_KEY = "require_access_codes";
export declare const RequireAccess: (...codes: string[]) => import("@nestjs/common").CustomDecorator<string>;
export declare class PermissionsGuard implements CanActivate {
    private readonly reflector;
    private readonly accessControlService;
    constructor(reflector: Reflector, accessControlService: AccessControlService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
