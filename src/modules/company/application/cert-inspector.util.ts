import * as forge from 'node-forge';

export interface CertInspectionResult {
	valid: boolean;
	expires_at: string; // YYYY-MM-DD
	issued_at: string;  // YYYY-MM-DD
	subject_name: string;
	issuer_name: string;
	is_expired: boolean;
}

/**
 * Inspecciona un archivo .p12 / .pfx codificado en Base64 con su contraseña
 * y extrae la fecha de caducidad, emisión, titular y emisor del certificado.
 */
export function inspectP12(p12Base64: string, password: string): CertInspectionResult {
	if (!p12Base64) {
		throw new Error('No se proporcionó el contenido del certificado .p12');
	}
	let p12: forge.pkcs12.Pkcs12Pfx;
	try {
		const cleanBase64 = p12Base64.replace(/^data:.*?;base64,/, '').trim();
		const der = forge.util.decode64(cleanBase64);
		p12 = forge.pkcs12.pkcs12FromAsn1(forge.asn1.fromDer(der), password || '');
	} catch (e: any) {
		throw new Error('No se pudo abrir la firma electrónica: archivo inválido o contraseña incorrecta.');
	}

	const certBags = p12.getBags({ bagType: forge.pki.oids.certBag })[forge.pki.oids.certBag] || [];
	if (!certBags.length || !certBags[0].cert) {
		throw new Error('El archivo .p12 no contiene un certificado X.509 válido.');
	}

	// Buscar el certificado principal (con clave privada asociada o validez activa)
	let targetCert = certBags[0].cert;
	for (const bag of certBags) {
		if (bag.cert && bag.cert.validity?.notAfter) {
			targetCert = bag.cert;
			break;
		}
	}

	const notAfter: Date = targetCert.validity.notAfter;
	const notBefore: Date = targetCert.validity.notBefore;
	const cn = targetCert.subject.getField('CN')?.value || '';
	const issuer = targetCert.issuer.getField('CN')?.value || targetCert.issuer.getField('O')?.value || '';

	return {
		valid: true,
		expires_at: notAfter.toISOString().slice(0, 10),
		issued_at: notBefore ? notBefore.toISOString().slice(0, 10) : '',
		subject_name: String(cn),
		issuer_name: String(issuer),
		is_expired: notAfter.getTime() < Date.now(),
	};
}
