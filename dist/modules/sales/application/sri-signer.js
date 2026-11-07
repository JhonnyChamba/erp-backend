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
exports.loadP12 = loadP12;
exports.signXadesBes = signXadesBes;
const forge = __importStar(require("node-forge"));
const NS_DS = 'http://www.w3.org/2000/09/xmldsig#';
const NS_ETSI = 'http://uri.etsi.org/01903/v1.3.2#';
const sha1b64 = (data) => {
    const md = forge.md.sha1.create();
    md.update(typeof data === 'string' ? forge.util.encodeUtf8(data) : data.toString('binary'));
    return forge.util.encode64(md.digest().getBytes());
};
const wrap76 = (b64) => b64.match(/.{1,76}/g).join('\n');
const rand = () => Math.floor(Math.random() * 900000) + 100000;
function loadP12(p12Base64, password) {
    let p12;
    try {
        const der = forge.util.decode64(p12Base64);
        p12 = forge.pkcs12.pkcs12FromAsn1(forge.asn1.fromDer(der), password);
    }
    catch {
        throw new Error('No se pudo abrir la firma electrónica: archivo inválido o contraseña incorrecta.');
    }
    const keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })[forge.pki.oids.pkcs8ShroudedKeyBag] || [];
    const plainKeyBags = p12.getBags({ bagType: forge.pki.oids.keyBag })[forge.pki.oids.keyBag] || [];
    const keyBag = [...keyBags, ...plainKeyBags].find((b) => b.key);
    const certBags = p12.getBags({ bagType: forge.pki.oids.certBag })[forge.pki.oids.certBag] || [];
    if (!keyBag?.key || certBags.length === 0) {
        throw new Error('La firma electrónica no contiene llave privada o certificado.');
    }
    const privateKey = keyBag.key;
    const match = certBags.find((b) => {
        const pub = b.cert?.publicKey;
        return pub && pub.n.compareTo(privateKey.n) === 0;
    });
    const cert = (match || certBags[0]).cert;
    const certDer = forge.asn1.toDer(forge.pki.certificateToAsn1(cert)).getBytes();
    return { privateKey, cert, certDerB64: forge.util.encode64(certDer), notAfter: cert.validity.notAfter };
}
const issuerName = (cert) => [...cert.issuer.attributes]
    .reverse()
    .map((a) => `${a.shortName || a.name}=${a.value}`)
    .join(',');
const bigToB64 = (n) => {
    let hex = n.toString(16);
    if (hex.length % 2)
        hex = '0' + hex;
    return forge.util.encode64(forge.util.hexToBytes(hex));
};
function signXadesBes(xml, loaded) {
    const sigId = `Signature${rand()}`;
    const signedPropsId = `${sigId}-SignedProperties${rand()}`;
    const certId = `Certificate${rand()}`;
    const refId = `Reference-ID-${rand()}`;
    const sigValueId = `SignatureValue${rand()}`;
    const nsDecl = `xmlns:ds="${NS_DS}" xmlns:etsi="${NS_ETSI}"`;
    const pub = loaded.cert.publicKey;
    const keyInfoInner = `<ds:X509Data><ds:X509Certificate>\n${wrap76(loaded.certDerB64)}\n</ds:X509Certificate></ds:X509Data>` +
        `<ds:KeyValue><ds:RSAKeyValue><ds:Modulus>\n${wrap76(bigToB64(pub.n))}\n</ds:Modulus>` +
        `<ds:Exponent>${bigToB64(pub.e)}</ds:Exponent></ds:RSAKeyValue></ds:KeyValue>`;
    const keyInfoForDigest = `<ds:KeyInfo ${nsDecl} Id="${certId}">${keyInfoInner}</ds:KeyInfo>`;
    const keyInfoInDoc = `<ds:KeyInfo Id="${certId}">${keyInfoInner}</ds:KeyInfo>`;
    const certDigest = sha1b64(Buffer.from(forge.util.decode64(loaded.certDerB64), 'binary'));
    const signingTime = new Date().toISOString().replace(/\.\d{3}Z$/, '-00:00');
    const signedPropsInner = `<etsi:SignedSignatureProperties>` +
        `<etsi:SigningTime>${signingTime}</etsi:SigningTime>` +
        `<etsi:SigningCertificate><etsi:Cert><etsi:CertDigest>` +
        `<ds:DigestMethod Algorithm="${NS_DS}sha1"></ds:DigestMethod>` +
        `<ds:DigestValue>${certDigest}</ds:DigestValue></etsi:CertDigest>` +
        `<etsi:IssuerSerial><ds:X509IssuerName>${issuerName(loaded.cert)}</ds:X509IssuerName>` +
        `<ds:X509SerialNumber>${BigInt('0x' + loaded.cert.serialNumber).toString()}</ds:X509SerialNumber>` +
        `</etsi:IssuerSerial></etsi:Cert></etsi:SigningCertificate></etsi:SignedSignatureProperties>` +
        `<etsi:SignedDataObjectProperties><etsi:DataObjectFormat ObjectReference="#${refId}">` +
        `<etsi:Description>contenido comprobante</etsi:Description><etsi:MimeType>text/xml</etsi:MimeType>` +
        `</etsi:DataObjectFormat></etsi:SignedDataObjectProperties>`;
    const signedPropsForDigest = `<etsi:SignedProperties ${nsDecl} Id="${signedPropsId}">${signedPropsInner}</etsi:SignedProperties>`;
    const signedPropsInDoc = `<etsi:SignedProperties Id="${signedPropsId}">${signedPropsInner}</etsi:SignedProperties>`;
    const docDigest = sha1b64(xml);
    const refs = `<ds:Reference Id="${sigId}-Ref0" URI="#${certId}"><ds:DigestMethod Algorithm="${NS_DS}sha1"></ds:DigestMethod>` +
        `<ds:DigestValue>${sha1b64(keyInfoForDigest)}</ds:DigestValue></ds:Reference>` +
        `<ds:Reference Type="http://uri.etsi.org/01903#SignedProperties" URI="#${signedPropsId}">` +
        `<ds:DigestMethod Algorithm="${NS_DS}sha1"></ds:DigestMethod>` +
        `<ds:DigestValue>${sha1b64(signedPropsForDigest)}</ds:DigestValue></ds:Reference>` +
        `<ds:Reference Id="${refId}" URI="#comprobante"><ds:Transforms>` +
        `<ds:Transform Algorithm="${NS_DS}enveloped-signature"></ds:Transform></ds:Transforms>` +
        `<ds:DigestMethod Algorithm="${NS_DS}sha1"></ds:DigestMethod><ds:DigestValue>${docDigest}</ds:DigestValue></ds:Reference>`;
    const signedInfoInner = `<ds:CanonicalizationMethod Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"></ds:CanonicalizationMethod>` +
        `<ds:SignatureMethod Algorithm="${NS_DS}rsa-sha1"></ds:SignatureMethod>${refs}`;
    const signedInfoForSign = `<ds:SignedInfo ${nsDecl}>${signedInfoInner}</ds:SignedInfo>`;
    const signedInfoInDoc = `<ds:SignedInfo>${signedInfoInner}</ds:SignedInfo>`;
    const md = forge.md.sha1.create();
    md.update(forge.util.encodeUtf8(signedInfoForSign));
    const signatureValue = wrap76(forge.util.encode64(loaded.privateKey.sign(md)));
    const signature = `<ds:Signature ${nsDecl} Id="${sigId}">${signedInfoInDoc}` +
        `<ds:SignatureValue Id="${sigValueId}">\n${signatureValue}\n</ds:SignatureValue>${keyInfoInDoc}` +
        `<ds:Object Id="${sigId}-Object${rand()}"><etsi:QualifyingProperties Target="#${sigId}">` +
        `${signedPropsInDoc}</etsi:QualifyingProperties></ds:Object></ds:Signature>`;
    return xml.replace(/<\/factura>$/, `${signature}</factura>`);
}
//# sourceMappingURL=sri-signer.js.map