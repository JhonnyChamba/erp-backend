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
Object.defineProperty(exports, "__esModule", { value: true });
exports.inspectP12 = inspectP12;
const forge = __importStar(require("node-forge"));
function inspectP12(p12Base64, password) {
    if (!p12Base64) {
        throw new Error('No se proporcionó el contenido del certificado .p12');
    }
    let p12;
    try {
        const cleanBase64 = p12Base64.replace(/^data:.*?;base64,/, '').trim();
        const der = forge.util.decode64(cleanBase64);
        p12 = forge.pkcs12.pkcs12FromAsn1(forge.asn1.fromDer(der), password || '');
    }
    catch (e) {
        throw new Error('No se pudo abrir la firma electrónica: archivo inválido o contraseña incorrecta.');
    }
    const certBags = p12.getBags({ bagType: forge.pki.oids.certBag })[forge.pki.oids.certBag] || [];
    if (!certBags.length || !certBags[0].cert) {
        throw new Error('El archivo .p12 no contiene un certificado X.509 válido.');
    }
    let targetCert = certBags[0].cert;
    for (const bag of certBags) {
        if (bag.cert && bag.cert.validity?.notAfter) {
            targetCert = bag.cert;
            break;
        }
    }
    const notAfter = targetCert.validity.notAfter;
    const notBefore = targetCert.validity.notBefore;
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
//# sourceMappingURL=cert-inspector.util.js.map