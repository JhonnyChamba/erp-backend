import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';

// Cifrado AES-256-GCM para secretos guardados en BD (clave de .p12, clave SMTP)
const getKey = () =>
	createHash('sha256')
		.update(process.env.SECRETS_KEY || process.env.JWT_SECRET || 'deskounta-dev-secret')
		.digest();

export function encryptSecret(plain: string): string {
	const iv = randomBytes(12);
	const cipher = createCipheriv('aes-256-gcm', getKey(), iv);
	const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
	return [iv.toString('base64'), cipher.getAuthTag().toString('base64'), enc.toString('base64')].join('.');
}

export function decryptSecret(payload: string): string {
	const [iv, tag, data] = payload.split('.');
	const decipher = createDecipheriv('aes-256-gcm', getKey(), Buffer.from(iv, 'base64'));
	decipher.setAuthTag(Buffer.from(tag, 'base64'));
	return Buffer.concat([decipher.update(Buffer.from(data, 'base64')), decipher.final()]).toString('utf8');
}

