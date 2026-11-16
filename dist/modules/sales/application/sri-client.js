"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sriReception = sriReception;
exports.sriAuthorization = sriAuthorization;
exports.sleep = sleep;
const SRI_URLS = {
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
function decodeXmlEntities(value) {
    return value
        .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&amp;/g, '&');
}
function tagText(xml, tag) {
    const match = xml.match(new RegExp(`<(?:[\\w-]+:)?${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</(?:[\\w-]+:)?${tag}>`, 'i'));
    return match ? decodeXmlEntities(match[1].trim()) : undefined;
}
function tagBlocks(xml, tag) {
    const regex = new RegExp(`<(?:[\\w-]+:)?${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</(?:[\\w-]+:)?${tag}>`, 'gi');
    const blocks = [];
    let match;
    while ((match = regex.exec(xml)) !== null)
        blocks.push(match[1]);
    return blocks;
}
function parseMessages(xml) {
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
async function soapPost(url, body) {
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
    }
    catch (e) {
        if (e?.name === 'AbortError')
            throw new Error('El SRI no respondió a tiempo (timeout). Intenta de nuevo en unos minutos.');
        if (e?.message?.startsWith('El SRI respondió'))
            throw e;
        throw new Error(`No se pudo conectar con el SRI: ${e?.message || e}`);
    }
    finally {
        clearTimeout(timer);
    }
}
async function sriReception(signedXml, environment) {
    const base64 = Buffer.from(signedXml, 'utf8').toString('base64');
    const envelope = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ec="http://ec.gob.sri.ws.recepcion">` +
        `<soapenv:Header/><soapenv:Body><ec:validarComprobante><xml>${base64}</xml></ec:validarComprobante></soapenv:Body></soapenv:Envelope>`;
    const rawXml = await soapPost(SRI_URLS[environment].recepcion, envelope);
    const estado = tagText(rawXml, 'estado') ?? 'DESCONOCIDO';
    return { estado, mensajes: parseMessages(rawXml), rawXml };
}
async function sriAuthorization(accessKey, environment) {
    const envelope = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ec="http://ec.gob.sri.ws.autorizacion">` +
        `<soapenv:Header/><soapenv:Body><ec:autorizacionComprobante><claveAccesoComprobante>${accessKey}</claveAccesoComprobante></ec:autorizacionComprobante></soapenv:Body></soapenv:Envelope>`;
    const rawXml = await soapPost(SRI_URLS[environment].autorizacion, envelope);
    const autorizaciones = tagBlocks(rawXml, 'autorizacion');
    if (autorizaciones.length === 0) {
        return { estado: 'EN PROCESO', mensajes: parseMessages(rawXml), rawXml };
    }
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
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
//# sourceMappingURL=sri-client.js.map