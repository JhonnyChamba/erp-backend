import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanyOrmEntity } from '../../infrastructure/persistence/company.orm-entity';
import { decryptSecret } from 'src/common/crypto/secret-crypto';
import { inspectP12, CertInspectionResult } from '../cert-inspector.util';

export class InspectCertDto {
	cert_p12_base64?: string;
	cert_password?: string;
}

@Injectable()
export class InspectCertUseCase {
	constructor(
		@InjectRepository(CompanyOrmEntity)
		private readonly repo: Repository<CompanyOrmEntity>,
	) {}

	async execute(companyId: number | null, dto: InspectCertDto): Promise<CertInspectionResult> {
		let p12Base64 = dto.cert_p12_base64;
		let password = dto.cert_password;

		let company: CompanyOrmEntity | null = null;
		if (companyId) {
			company = await this.repo
				.createQueryBuilder('c')
				.addSelect(['c.cert_p12_base64', 'c.cert_password_enc'])
				.where('c.id = :id AND c.deleted = false', { id: companyId })
				.getOne();

			if (!company) {
				throw new NotFoundException('Empresa no encontrada.');
			}

			if (!p12Base64 && company.cert_p12_base64) {
				p12Base64 = company.cert_p12_base64;
			}

			if (!password && company.cert_password_enc) {
				try {
					password = decryptSecret(company.cert_password_enc);
				} catch (e) {
					// Fallback si no se puede descifrar
				}
			}
		}

		if (!p12Base64) {
			throw new BadRequestException('No se ha proporcionado ni encontrado el archivo de firma (.p12).');
		}

		if (!password) {
			throw new BadRequestException('Debes ingresar la contraseña de la firma electrónica para inspeccionarla.');
		}

		try {
			const result = inspectP12(p12Base64, password);

			// Si la empresa existe y no tenía fecha de caducidad o cambió, actualizarla en la BD
			if (company && result.expires_at && company.cert_expires_at !== result.expires_at) {
				await this.repo.update({ id: company.id }, { cert_expires_at: result.expires_at });
			}

			return result;
		} catch (err: any) {
			throw new BadRequestException(err?.message || 'Error al inspeccionar el certificado .p12');
		}
	}
}
