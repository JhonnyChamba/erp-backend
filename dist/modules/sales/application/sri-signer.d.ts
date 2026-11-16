import * as forge from 'node-forge';
export interface LoadedCert {
    privateKey: forge.pki.rsa.PrivateKey;
    cert: forge.pki.Certificate;
    certDerB64: string;
    notAfter: Date;
}
export declare function loadP12(p12Base64: string, password: string): LoadedCert;
export declare function signXadesBes(xml: string, loaded: LoadedCert): string;
