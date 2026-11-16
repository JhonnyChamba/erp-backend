export type SriEnvironment = '1' | '2';
export interface SriMessage {
    identificador: string;
    mensaje: string;
    informacionAdicional?: string;
    tipo?: string;
}
export interface SriReceptionResult {
    estado: 'RECIBIDA' | 'DEVUELTA' | string;
    mensajes: SriMessage[];
    rawXml: string;
}
export interface SriAuthorizationResult {
    estado: 'AUTORIZADO' | 'NO AUTORIZADO' | 'EN PROCESO' | string;
    numeroAutorizacion?: string;
    fechaAutorizacion?: string;
    ambiente?: string;
    mensajes: SriMessage[];
    rawXml: string;
}
export declare function sriReception(signedXml: string, environment: SriEnvironment): Promise<SriReceptionResult>;
export declare function sriAuthorization(accessKey: string, environment: SriEnvironment): Promise<SriAuthorizationResult>;
export declare function sleep(ms: number): Promise<void>;
