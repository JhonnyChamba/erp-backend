import {
	Controller,
	Post,
	Get,
	Param,
	Query,
	UploadedFile,
	UseInterceptors,
	UseGuards,
	Req,
	Res,
	ForbiddenException,
	NotFoundException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import * as path from 'path';
import { AccessControlService } from 'src/auth/access-control.service';
import { CompanyAccessGuard } from 'src/auth/guards/company-access.guard';
import { MAX_IMAGE_SIZE_BYTES, StorageService } from './storage.service';

const getMimeTypeFromExt = (filePath: string): string => {
	const ext = path.extname(filePath).toLowerCase();
	switch (ext) {
		case '.png': return 'image/png';
		case '.jpg':
		case '.jpeg': return 'image/jpeg';
		case '.webp': return 'image/webp';
		case '.svg': return 'image/svg+xml';
		case '.gif': return 'image/gif';
		default: return 'application/octet-stream';
	}
};

// Límite aplicado por multer mientras recibe el archivo (no después de tenerlo completo en memoria).
const imageUploadOptions = { limits: { fileSize: MAX_IMAGE_SIZE_BYTES, files: 1 } };

@Controller('storage')
export class StorageController {
	constructor(
		private readonly storageService: StorageService,
		private readonly accessControlService: AccessControlService,
	) {}

	/** Empresa de la operación: la indicada en el query o la activa. Ambas ya validadas por CompanyAccessGuard. */
	private resolveCompanyId(req: any, companyIdQuery?: string): number {
		return Number(companyIdQuery) || Number(req.companyId);
	}

	/** Sube el logo oficial de la empresa */
	@UseGuards(AuthGuard('jwt'), CompanyAccessGuard)
	@Post('company/:companyId/logo')
	@UseInterceptors(FileInterceptor('file', imageUploadOptions))
	async uploadCompanyLogo(
		@Param('companyId') companyId: number,
		@Req() req: any,
		@UploadedFile() file: any,
	) {
		// El id llega en la ruta (el guard no lo ve): se comprueba que el usuario pertenezca a esa empresa.
		const targetCompanyId = Number(companyId);
		if (
			!Number.isInteger(targetCompanyId) ||
			targetCompanyId <= 0 ||
			!(await this.accessControlService.canAccessCompany(req.user, targetCompanyId))
		) {
			throw new ForbiddenException('No tienes acceso a la empresa indicada');
		}
		return this.storageService.uploadCompanyLogo(targetCompanyId, file);
	}

	/** Sube el logo específico de la sucursal/establecimiento */
	@UseGuards(AuthGuard('jwt'), CompanyAccessGuard)
	@Post('branch/:branchId/logo')
	@UseInterceptors(FileInterceptor('file', imageUploadOptions))
	async uploadBranchLogo(
		@Param('branchId') branchId: number,
		@Query('companyId') companyIdQuery: string,
		@Req() req: any,
		@UploadedFile() file: any,
	) {
		// El servicio solo encuentra la sucursal si pertenece a esta empresa.
		const companyId = this.resolveCompanyId(req, companyIdQuery);
		return this.storageService.uploadBranchLogo(Number(branchId), companyId, file);
	}

	/** Sube la foto de perfil del usuario */
	@UseGuards(AuthGuard('jwt'), CompanyAccessGuard)
	@Post('user/:userId/photo')
	@UseInterceptors(FileInterceptor('file', imageUploadOptions))
	async uploadUserPhoto(
		@Param('userId') userId: number,
		@Req() req: any,
		@UploadedFile() file: any,
	) {
		// Solo la propia foto, la de un usuario de la empresa activa, o cualquiera si es super admin.
		const targetUserId = Number(userId);
		const isOwnPhoto = targetUserId === Number(req.user?.user_id);
		if (
			!isOwnPhoto &&
			!(await this.accessControlService.isSuperAdmin(req.user)) &&
			!(await this.storageService.userBelongsToCompany(targetUserId, Number(req.companyId)))
		) {
			throw new ForbiddenException('No tienes acceso al usuario indicado');
		}
		return this.storageService.uploadUserPhoto(targetUserId, file);
	}

	/** Sube el escudo/logo de un equipo de campeonato */
	@UseGuards(AuthGuard('jwt'), CompanyAccessGuard)
	@Post('team-logo')
	@UseInterceptors(FileInterceptor('file', imageUploadOptions))
	async uploadTeamLogo(
		@Query('companyId') companyIdQuery: string,
		@Req() req: any,
		@UploadedFile() file: any,
	) {
		const companyId = this.resolveCompanyId(req, companyIdQuery);
		return this.storageService.uploadTeamLogo(companyId, file);
	}

	/** Sube la foto oficial de un jugador de campeonato */
	@UseGuards(AuthGuard('jwt'), CompanyAccessGuard)
	@Post('player-photo')
	@UseInterceptors(FileInterceptor('file', imageUploadOptions))
	async uploadPlayerPhoto(
		@Query('companyId') companyIdQuery: string,
		@Req() req: any,
		@UploadedFile() file: any,
	) {
		const companyId = this.resolveCompanyId(req, companyIdQuery);
		return this.storageService.uploadPlayerPhoto(companyId, file);
	}

	/** Sirve archivos locales de respaldo (cuando no hay CDN de Supabase activo) */
	@Get('uploads/*path')
	async serveLocalFile(@Req() req: any, @Res() res: any) {
		const urlPath = req.url.split('?')[0];
		const prefix = '/storage/uploads/';
		const subPath = urlPath.startsWith(prefix) ? urlPath.slice(prefix.length) : '';

		const filePath = this.storageService.getLocalFilePath(decodeURIComponent(subPath));
		if (!filePath) {
			throw new NotFoundException('Archivo no encontrado');
		}

		res.setHeader('Content-Type', getMimeTypeFromExt(filePath));
		res.setHeader('Cache-Control', 'public, max-age=86400');
		// Archivos subidos por usuarios: que el navegador no adivine el tipo ni ejecute scripts
		// (p. ej. un SVG antiguo abierto directamente). No afecta a su uso en <img>.
		res.setHeader('X-Content-Type-Options', 'nosniff');
		res.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'; sandbox");
		res.sendFile(filePath);
	}
}
