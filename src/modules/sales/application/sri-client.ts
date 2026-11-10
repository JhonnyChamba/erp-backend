/**
 * Cliente de los web services "offline" de comprobantes electrónicos del SRI Ecuador.
 *
 * Flujo oficial en dos pasos:
 *  1. Recepción  (validarComprobante)     → el SRI responde RECIBIDA o DEVUELTA (con mensajes de error).
 *  2. Autorización (autorizacionComprobante) → AUTORIZADO / NO AUTORIZADO / sin respuesta aún (EN PROCESO).
 *
 * Se usa fetch nativo de Node 20 y se arma el sobre SOAP a mano; la respuesta se lee con expresiones
 * regulares sobre el XML, suficiente para la estructura fija que devuelve el SRI.
 */

export type SriEnvironment = '1' | '2'; // 1 pruebas, 2 producción

export interface SriMessage {
	identificador: string;
	mensaje: string;
	informacionAdicional?: string;
	tipo?: string; // ERROR | ADVERTENCIA
}

export interface SriReceptionResult {
	estado: 'RECIBIDA' | 'DEVUELTA' | string;
	mensajes: SriMessage[];
	rawXml: string;
}

export interface SriAuthorizationResult {
	/** AUTORIZADO | NO AUTORIZADO | EN PROCESO (el SRI aún no tiene respuesta para la clave) */
	estado: 'AUTORIZADO' | 'NO AUTORIZADO' | 'EN PROCESO' | string;
	numeroAutorizacion?: string;
	fechaAutorizacion?: string;
	ambiente?: string;
	mensajes: SriMessage[];
	rawXml: string;
}

const SRI_URLS: Record<SriEnvironment, { recepcion: string; autorizacion: string }> = {
	'1': {
		recepcion: 'https://celcer.sri.gob.ec/comprobantes-electronicos-ws/RecepcionComprobantesOffline',
		autorizacion: 'https://celcer.sri.gob.ec/comprobantes-electronicos-ws/AutorizacionComprobantesOffline',
	},
	'2': {
		recepcion: 'https://cel.sri.gob.ec/comprobantes-electronicos-ws/RecepcionComprobantesOffline',
		autorizacion: 'https://cel.sri.gob.ec/comprobantes-electronicos-ws/AutorizacionComprobantesOffline',
	},
};

const REQUEST_TIMEOUT_MS = 30_000;

function decodeXmlEntities(value: string): string {
	return value
		.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&apos;/g, "'")
		.replace(/&amp;/g, '&');
}

/** Texto del primer elemento <tag>...</tag> (ignora prefijos de namespace). */
function tagText(xml: string, tag: string): string | undefined {
	const match = xml.match(new RegExp(`<(?:[\\w-]+:)?${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</(?:[\\w-]+:)?${tag}>`, 'i'));
	return match ? decodeXmlEntities(match[1].trim()) : undefined;
}

/** Todos los bloques <tag>...</tag>. */
function tagBlocks(xml: string, tag: string): string[] {
	const regex = new RegExp(`<(?:[\\w-]+:)?${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</(?:[\\w-]+:)?${tag}>`, 'gi');
	const blocks: string[] = [];
	let match: RegExpExecArray | null;
	while ((match = regex.exec(xml)) !== null) blocks.push(match[1]);
	return blocks;
}

function parseMessages(xml: string): SriMessage[] {
	return tagBlocks(xml, 'mensaje')
		.filter((block) => /<(?:[\w-]+:)?identificador/i.test(block) || /<(?:[\w-]+:)?mensaje/i.test(block))
		.map((block) => ({
			identificador: tagText(block, 'identificador') ?? '',
			mensaje: tagText(block, 'mensaje') ?? '',
			informacionAdicional: tagText(block, 'informacionAdicional'),
			tipo: tagText(block, 'tipo'),
		}))
		.filter((m) => m.identificador || m.mensaje);
}

async function soapPost(url: string, body: string): Promise<string> {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
	try {
		const response = await fetch(url, {
			method: 'POST',
			headers: { 'Content-Type': 'text/xml; charset=utf-8', SOAPAction: '' },
			body,
			signal: controller.signal,
		});
		const text = await response.text();
		if (!response.ok) {
			const fault = tagText(text, 'faultstring');
			throw new Error(`El SRI respondió HTTP ${response.status}${fault ? `: ${fault}` : ''}.`);
		}
		return text;
	} catch (e: any) {
		if (e?.name === 'AbortError') throw new Error('El SRI no respondió a tiempo (timeout). Intenta de nuevo en unos minutos.');
		if (e?.message?.startsWith('El SRI respondió')) throw e;
		throw new Error(`No se pudo conectar con el SRI: ${e?.message || e}`);
	} finally {
		clearTimeout(timer);
	}
}

/** Paso 1: envía el XML firmado al servicio de recepción. */
export async function sriReception(signedXml: string, environment: SriEnvironment): Promise<SriReceptionResult> {
	const base64 = Buffer.from(signedXml, 'utf8').toString('base64');
	const envelope =
		`<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ec="http://ec.gob.sri.ws.recepcion">` +
		`<soapenv:Header/><soapenv:Body><ec:validarComprobante><xml>${base64}</xml></ec:validarComprobante></soapenv:Body></soapenv:Envelope>`;

	const rawXml = await soapPost(SRI_URLS[environment].recepcion, envelope);
	const estado = tagText(rawXml, 'estado') ?? 'DESCONOCIDO';
	return { estado, mensajes: parseMessages(rawXml), rawXml };
}

/** Paso 2: consulta la autorización de un comprobante por su clave de acceso. */
export async function sriAuthorization(accessKey: string, environment: SriEnvironment): Promise<SriAuthorizationResult> {
	const envelope =
		`<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ec="http://ec.gob.sri.ws.autorizacion">` +
		`<soapenv:Header/><soapenv:Body><ec:autorizacionComprobante><claveAccesoComprobante>${accessKey}</claveAccesoComprobante></ec:autorizacionComprobante></soapenv:Body></soapenv:Envelope>`;

	const rawXml = await soapPost(SRI_URLS[environment].autorizacion, envelope);
	const autorizaciones = tagBlocks(rawXml, 'autorizacion');
	if (autorizaciones.length === 0) {
		// El SRI todavía no procesó la clave (numeroComprobantes = 0).
		return { estado: 'EN PROCESO', mensajes: parseMessages(rawXml), rawXml };
	}

	// Si hay varias respuestas, prevalece la autorizada.
	const chosen = autorizaciones.find((a) => (tagText(a, 'estado') ?? '').toUpperCase() === 'AUTORIZADO') ?? autorizaciones[0];
	return {
		estado: (tagText(chosen, 'estado') ?? 'DESCONOCIDO').toUpperCase(),
		numeroAutorizacion: tagText(chosen, 'numeroAutorizacion'),
		fechaAutorizacion: tagText(chosen, 'fechaAutorizacion'),
		ambiente: tagText(chosen, 'ambiente'),
		mensajes: parseMessages(chosen),
		rawXml,
	};
}

export function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
