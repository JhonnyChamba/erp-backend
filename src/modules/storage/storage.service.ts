import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { CompanyOrmEntity } from '../company/infrastructure/persistence/company.orm-entity';
import { BranchCompanyOrmEntity } from '../branch-company/infrastructure/persistence/branch-company.orm-entity';
import { UsersOrmEntity } from '../users/infrastructure/persistence/users.orm-entity';

@Injectable()
export class StorageService {
	private readonly logger = new Logger(StorageService.name);
	private readonly supabaseUrl: string;
	private readonly supabaseKey: string;
	private readonly bucketName: string;
	private readonly localUploadsRoot: string;

	constructor(
		@InjectRepository(CompanyOrmEntity)
		private readonly companyRepo: Repository<CompanyOrmEntity>,
		@InjectRepository(BranchCompanyOrmEntity)
		private readonly branchRepo: Repository<BranchCompanyOrmEntity>,
		@InjectRepository(UsersOrmEntity)
		private readonly usersRepo: Repository<UsersOrmEntity>,
	) {
		this.supabaseUrl = (process.env.SUPABASE_URL || 'https://tnbfcixqgrspmgqrgnag.supabase.co').replace(/\/+$/, '');
		this.supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
		this.bucketName = process.env.SUPABASE_BUCKET || 'deskounta-assets';
		this.localUploadsRoot = path.resolve(process.cwd(), 'uploads');
	}

	private validateImage(file: any) {
		if (!file || !file.buffer) {
			throw new BadRequestException('No se ha proporcionado ningún archivo');
		}
		const allowedMimes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];
		if (!allowedMimes.includes(file.mimetype)) {
			throw new BadRequestException('Formato no permitido. Solo se aceptan imágenes (PNG, JPEG, WEBP, SVG)');
		}
		// Máx 5MB
		if (file.size > 5 * 1024 * 1024) {
			throw new BadRequestException('La imagen excede el límite máximo de 5MB');
		}
	}

	private getExtension(mimetype: string, originalName?: string): string {
		if (originalName && originalName.includes('.')) {
			const ext = originalName.split('.').pop()?.toLowerCase();
			if (ext) return `.${ext}`;
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

	async uploadRaw(file: any, storagePath: string): Promise<string> {
		this.validateImage(file);

		// 1. Intentar subir a Supabase Storage si se cuenta con la clave
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
				} else {
					const errText = await res.text();
					this.logger.warn(`[Supabase Storage] Error en API (${res.status}): ${errText}. Usando respaldo local.`);
				}
			} catch (err) {
				this.logger.warn(`[Supabase Storage] Excepción al conectar: ${err.message}. Usando respaldo local.`);
			}
		}

		// 2. Almacenamiento local de respaldo
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

	async uploadCompanyLogo(companyId: number, file: any): Promise<{ url: string }> {
		const company = await this.companyRepo.findOne({ where: { id: Number(companyId), deleted: false } });
		if (!company) throw new NotFoundException('Empresa no encontrada');

		const ext = this.getExtension(file.mimetype, file.originalname);
		const storagePath = `companies/${companyId}/logo${ext}`;
		const url = await this.uploadRaw(file, storagePath);

		await this.companyRepo.update({ id: Number(companyId) }, { logo_url: url });
		return { url };
	}

	async uploadBranchLogo(branchId: number, companyId: number, file: any): Promise<{ url: string }> {
		const branch = await this.branchRepo.findOne({
			where: { id: Number(branchId), company: { id: Number(companyId) }, deleted: false },
		});
		if (!branch) throw new NotFoundException('Sucursal no encontrada');

		const ext = this.getExtension(file.mimetype, file.originalname);
		const storagePath = `branches/${companyId}/${branchId}/logo${ext}`;
		const url = await this.uploadRaw(file, storagePath);

		await this.branchRepo.update({ id: Number(branchId) }, { logo_url: url });
		return { url };
	}

	async uploadUserPhoto(userId: number, file: any): Promise<{ url: string }> {
		const user = await this.usersRepo.findOne({ where: { id: Number(userId), deleted: false } });
		if (!user) throw new NotFoundException('Usuario no encontrado');

		const ext = this.getExtension(file.mimetype, file.originalname);
		const storagePath = `users/${userId}/avatar${ext}`;
		const url = await this.uploadRaw(file, storagePath);

		await this.usersRepo.update({ id: Number(userId) }, { photo_url: url });
		return { url };
	}

	getLocalFilePath(subPath: string): string | null {
		const fullPath = path.resolve(this.localUploadsRoot, subPath);
		// Prevenir directory traversal
		if (!fullPath.startsWith(this.localUploadsRoot) || !fs.existsSync(fullPath)) {
			return null;
		}
		return fullPath;
	}
}
