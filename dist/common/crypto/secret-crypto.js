"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encryptSecret = encryptSecret;
exports.decryptSecret = decryptSecret;
const crypto_1 = require("crypto");
const getKey = () => (0, crypto_1.createHash)('sha256')
    .update(process.env.SECRETS_KEY || process.env.JWT_SECRET || 'deskounta-dev-secret')
    .digest();
function encryptSecret(plain) {
    const iv = (0, crypto_1.randomBytes)(12);
    const cipher = (0, crypto_1.createCipheriv)('aes-256-gcm', getKey(), iv);
    const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
    return [iv.toString('base64'), cipher.getAuthTag().toString('base64'), enc.toString('base64')].join('.');
}
function decryptSecret(payload) {
    const [iv, tag, data] = payload.split('.');
    const decipher = (0, crypto_1.createDecipheriv)('aes-256-gcm', getKey(), Buffer.from(iv, 'base64'));
    decipher.setAuthTag(Buffer.from(tag, 'base64'));
    return Buffer.concat([decipher.update(Buffer.from(data, 'base64')), decipher.final()]).toString('utf8');
}
//# sourceMappingURL=secret-crypto.js.map