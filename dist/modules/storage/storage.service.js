"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var StorageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const company_orm_entity_1 = require("../company/infrastructure/persistence/company.orm-entity");
const branch_company_orm_entity_1 = require("../branch-company/infrastructure/persistence/branch-company.orm-entity");
const users_orm_entity_1 = require("../users/infrastructure/persistence/users.orm-entity");
let StorageService = StorageService_1 = class StorageService {
    companyRepo;
    branchRepo;
    usersRepo;
    logger = new common_1.Logger(StorageService_1.name);
    supabaseUrl;
    supabaseKey;
    bucketName;
    localUploadsRoot;
    constructor(companyRepo, branchRepo, usersRepo) {
        this.companyRepo = companyRepo;
        this.branchRepo = branchRepo;
        this.usersRepo = usersRepo;
        this.supabaseUrl = (process.env.SUPABASE_URL || 'https://tnbfcixqgrspmgqrgnag.supabase.co').replace(/\/+$/, '');
        this.supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
        this.bucketName = process.env.SUPABASE_BUCKET || 'deskounta-assets';
        this.localUploadsRoot = path.resolve(process.cwd(), 'uploads');
    }
    validateImage(file) {
        if (!file || !file.buffer) {
            throw new common_1.BadRequestException('No se ha proporcionado ningún archivo');
        }
        const allowedMimes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];
        if (!allowedMimes.includes(file.mimetype)) {
            throw new common_1.BadRequestException('Formato no permitido. Solo se aceptan imágenes (PNG, JPEG, WEBP, SVG)');
        }
        if (file.size > 5 * 1024 * 1024) {
            throw new common_1.BadRequestException('La imagen excede el límite máximo de 5MB');
        }
    }
    getExtension(mimetype, originalName) {
        if (originalName && originalName.includes('.')) {
            const ext = originalName.split('.').pop()?.toLowerCase();
            if (ext)
                return `.${ext}`;
        }
        switch (mimetype) {
            case 'image/png': return '.png';
            case 'image/jpeg':
            case 'image/jpg': return '.jpg';
            case 'image/webp': return '.webp';
            case 'image/svg+xml': return '.svg';
            default: return '.png';
        }
    }
    async uploadRaw(file, storagePath) {
        this.validateImage(file);
        if (this.supabaseKey) {
            try {
                const uploadEndpoint = `${this.supabaseUrl}/storage/v1/object/${this.bucketName}/${storagePath}`;
                const res = await fetch(uploadEndpoint, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.supabaseKey}`,
                        'apikey': this.supabaseKey,
                        'Content-Type': file.mimetype,
                        'x-upsert': 'true',
                    },
                    body: file.buffer,
                });
                if (res.ok) {
                    const publicUrl = `${this.supabaseUrl}/storage/v1/object/public/${this.bucketName}/${storagePath}?t=${Date.now()}`;
                    this.logger.log(`[Supabase Storage] Archivo subido con éxito: ${publicUrl}`);
                    return publicUrl;
                }
                else {
                    const errText = await res.text();
                    this.logger.warn(`[Supabase Storage] Error en API (${res.status}): ${errText}. Usando respaldo local.`);
                }
            }
            catch (err) {
                this.logger.warn(`[Supabase Storage] Excepción al conectar: ${err.message}. Usando respaldo local.`);
            }
        }
        if (file.buffer && (storagePath.startsWith('users/') || file.size <= 2.5 * 1024 * 1024)) {
            try {
                const fullLocalPath = path.join(this.localUploadsRoot, storagePath);
                const dir = path.dirname(fullLocalPath);
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }
                fs.writeFileSync(fullLocalPath, file.buffer);
            }
            catch (writeErr) {
                this.logger.warn(`[Storage] No se pudo escribir en disco local (entorno serverless/efímero): ${writeErr.message}`);
            }
            const dataUri = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
            this.logger.log(`[Storage] Archivo procesado como Data URI base64 (${Math.round(file.size / 1024)} KB)`);
            return dataUri;
        }
        const fullLocalPath = path.join(this.localUploadsRoot, storagePath);
        const dir = path.dirname(fullLocalPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(fullLocalPath, file.buffer);
        const serverBase = process.env.BACKEND_PUBLIC_URL || `http://localhost:${process.env.PORT || 3000}`;
        const localUrl = `${serverBase}/storage/uploads/${storagePath.replace(/\\/g, '/')}?t=${Date.now()}`;
        this.logger.log(`[Local Storage] Archivo guardado localmente: ${localUrl}`);
        return localUrl;
    }
    async uploadCompanyLogo(companyId, file) {
        const company = await this.companyRepo.findOne({ where: { id: Number(companyId), deleted: false } });
        if (!company)
            throw new common_1.NotFoundException('Empresa no encontrada');
        const ext = this.getExtension(file.mimetype, file.originalname);
        const storagePath = `companies/${companyId}/logo${ext}`;
        const url = await this.uploadRaw(file, storagePath);
        await this.companyRepo.update({ id: Number(companyId) }, { logo_url: url });
        return { url };
    }
    async uploadBranchLogo(branchId, companyId, file) {
        const branch = await this.branchRepo.findOne({
            where: { id: Number(branchId), company: { id: Number(companyId) }, deleted: false },
        });
        if (!branch)
            throw new common_1.NotFoundException('Sucursal no encontrada');
        const ext = this.getExtension(file.mimetype, file.originalname);
        const storagePath = `branches/${companyId}/${branchId}/logo${ext}`;
        const url = await this.uploadRaw(file, storagePath);
        await this.branchRepo.update({ id: Number(branchId) }, { logo_url: url });
        return { url };
    }
    async uploadUserPhoto(userId, file) {
        const user = await this.usersRepo.findOne({ where: { id: Number(userId), deleted: false } });
        if (!user)
            throw new common_1.NotFoundException('Usuario no encontrado');
        const ext = this.getExtension(file.mimetype, file.originalname);
        const storagePath = `users/${userId}/avatar${ext}`;
        const url = await this.uploadRaw(file, storagePath);
        await this.usersRepo.update({ id: Number(userId) }, { photo_url: url });
        return { url };
    }
    getLocalFilePath(subPath) {
        const fullPath = path.resolve(this.localUploadsRoot, subPath);
        if (!fullPath.startsWith(this.localUploadsRoot) || !fs.existsSync(fullPath)) {
            return null;
        }
        return fullPath;
    }
};
exports.StorageService = StorageService;
exports.StorageService = StorageService = StorageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(company_orm_entity_1.CompanyOrmEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(branch_company_orm_entity_1.BranchCompanyOrmEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(users_orm_entity_1.UsersOrmEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], StorageService);
//# sourceMappingURL=storage.service.js.map