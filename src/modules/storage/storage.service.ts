import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { CompanyOrmEntity } from '../company/infrastructure/persistence/company.orm-entity';
import { BranchCompanyOrmEntity } from '../branch-company/infrastructure/persistence/branch-company.orm-entity';
import { UsersOrmEntity } from '../users/infrastructure/persistence/users.orm-entity';

/** Tamaño máximo de imagen (5MB). Se aplica también como límite de multer en el controlador. */
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_MIMES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
const ALLOWED_IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp'];

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

	/** Formato real de la imagen según sus primeros bytes (el mimetype y el nombre los declara el cliente). */
	private detectImageFormat(buffer: Buffer): 'png' | 'jpeg' | 'webp' | null {
		if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
			return 'png';
		}
		if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
			return 'jpeg';
		}
		if (buffer.length >= 12 && buffer.toString('latin1', 0, 4) === 'RIFF' && buffer.toString('latin1', 8, 12) === 'WEBP') {
			return 'webp';
		}
		return null;
	}

	/**
	 * Valida el archivo y devuelve la extensión con la que se guarda (derivada del contenido, nunca del
	 * nombre original). SVG no se admite: puede contener scripts y se serviría desde el propio dominio.
	 */
	private validateImage(file: any): string {
		if (!file || !Buffer.isBuffer(file.buffer)) {
			throw new BadRequestException('No se ha proporcionado ningún archivo');
		}
		const formatError = 'Formato no permitido. Solo se aceptan imágenes (PNG, JPEG, WEBP)';
		if (!ALLOWED_IMAGE_MIMES.includes(file.mimetype)) {
			throw new BadRequestException(formatError);
		}
		const originalExt = path.extname(String(file.originalname || '')).toLowerCase();
		if (originalExt && !ALLOWED_IMAGE_EXTENSIONS.includes(originalExt)) {
			throw new BadRequestException(formatError);
		}
		if (file.size > MAX_IMAGE_SIZE_BYTES) {
			throw new BadRequestException('La imagen excede el límite máximo de 5MB');
		}
		const format = this.detectImageFormat(file.buffer);
		if (!format) {
			throw new BadRequestException(formatError);
		}
		return format === 'jpeg' ? '.jpg' : `.${format}`;
	}

	/** Indica si el usuario pertenece a la empresa (empresa principal o relación usuario-empresa activa). */
	async userBelongsToCompany(userId: number, companyId: number): Promise<boolean> {
		if (!Number.isInteger(userId) || userId <= 0 || !Number.isInteger(companyId) || companyId <= 0) return false;
		return this.usersRepo.exists({
			where: [
				{ id: userId, deleted: false, company: { id: companyId } },
				{ id: userId, deleted: false, userCompanies: { company: { id: companyId }, deleted: false, enabled: true } },
			],
		});
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

		// 2. Almacenamiento local o Data URI de respaldo
		// Para fotos de perfil de usuario o archivos pequeños en entornos cloud/serverless (como Vercel sin disco persistente),
		// una URI Data Base64 garantiza visualización inmediata en producción sin requerir servidor de archivos adicional.
		if (file.buffer && (storagePath.startsWith('users/') || file.size <= 2.5 * 1024 * 1024)) {
			try {
				const fullLocalPath = path.join(this.localUploadsRoot, storagePath);
				const dir = path.dirname(fullLocalPath);
				if (!fs.existsSync(dir)) {
					fs.mkdirSync(dir, { recursive: true });
				}
				fs.writeFileSync(fullLocalPath, file.buffer);
			} catch (writeErr) {
				this.logger.warn(`[Storage] No se pudo escribir en disco local (entorno serverless/efímero): ${writeErr.message}`);
			}
			const dataUri = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
			this.logger.log(`[Storage] Archivo procesado como Data URI base64 (${Math.round(file.size / 1024)} KB)`);
			return dataUri;
		}

		// Respaldo tradicional con ruta estática local
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

		const ext = this.validateImage(file);
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

		const ext = this.validateImage(file);
		const storagePath = `branches/${companyId}/${branchId}/logo${ext}`;
		const url = await this.uploadRaw(file, storagePath);

		await this.branchRepo.update({ id: Number(branchId) }, { logo_url: url });
		return { url };
	}

	async uploadUserPhoto(userId: number, file: any): Promise<{ url: string }> {
		const user = await this.usersRepo.findOne({ where: { id: Number(userId), deleted: false } });
		if (!user) throw new NotFoundException('Usuario no encontrado');

		const ext = this.validateImage(file);
		const storagePath = `users/${userId}/avatar${ext}`;
		const url = await this.uploadRaw(file, storagePath);

		await this.usersRepo.update({ id: Number(userId) }, { photo_url: url });
		return { url };
	}

	async uploadTeamLogo(companyId: number, file: any): Promise<{ url: string }> {
		const ext = this.validateImage(file);
		const storagePath = `teams/${companyId}/${Date.now()}_logo${ext}`;
		const url = await this.uploadRaw(file, storagePath);
		return { url };
	}

	async uploadPlayerPhoto(companyId: number, file: any): Promise<{ url: string }> {
		const ext = this.validateImage(file);
		const storagePath = `players/${companyId}/${Date.now()}_photo${ext}`;
		const url = await this.uploadRaw(file, storagePath);
		return { url };
	}

	getLocalFilePath(subPath: string): string | null {
		const fullPath = path.resolve(this.localUploadsRoot, subPath);
		// Prevenir directory traversal: debe quedar DENTRO de uploads/ (con separador, para no aceptar
		// directorios hermanos como "uploads-privado") y ser un archivo regular.
		if (!fullPath.startsWith(this.localUploadsRoot + path.sep)) {
			return null;
		}
		try {
			return fs.statSync(fullPath).isFile() ? fullPath : null;
		} catch {
			return null;
		}
	}
}

