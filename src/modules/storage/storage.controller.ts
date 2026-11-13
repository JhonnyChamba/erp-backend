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
	NotFoundException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import * as path from 'path';
import { StorageService } from './storage.service';

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

@Controller('storage')
export class StorageController {
	constructor(private readonly storageService: StorageService) {}

	/** Sube el logo oficial de la empresa */
	@UseGuards(AuthGuard('jwt'))
	@Post('company/:companyId/logo')
	@UseInterceptors(FileInterceptor('file'))
	async uploadCompanyLogo(
		@Param('companyId') companyId: number,
		@UploadedFile() file: any,
	) {
		return this.storageService.uploadCompanyLogo(Number(companyId), file);
	}

	/** Sube el logo específico de la sucursal/establecimiento */
	@UseGuards(AuthGuard('jwt'))
	@Post('branch/:branchId/logo')
	@UseInterceptors(FileInterceptor('file'))
	async uploadBranchLogo(
		@Param('branchId') branchId: number,
		@Query('companyId') companyIdQuery: string,
		@Req() req: any,
		@UploadedFile() file: any,
	) {
		const companyId = Number(companyIdQuery || req.headers?.['x-company-id'] || req.user?.company_id || 1);
		return this.storageService.uploadBranchLogo(Number(branchId), companyId, file);
	}

	/** Sube la foto de perfil del usuario */
	@UseGuards(AuthGuard('jwt'))
	@Post('user/:userId/photo')
	@UseInterceptors(FileInterceptor('file'))
	async uploadUserPhoto(
		@Param('userId') userId: number,
		@UploadedFile() file: any,
	) {
		return this.storageService.uploadUserPhoto(Number(userId), file);
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
		res.sendFile(filePath);
	}
}
