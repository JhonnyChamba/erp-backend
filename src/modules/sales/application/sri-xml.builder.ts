import { InvoiceOrmEntity } from '../infrastructure/persistence/invoice.orm-entity';
import { CreditNoteOrmEntity } from '../infrastructure/persistence/credit-note.orm-entity';
import { CompanyOrmEntity } from 'src/modules/company/infrastructure/persistence/company.orm-entity';

const esc = (v: any) =>
	String(v ?? '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.trim();

const money = (v: any) => Number(v || 0).toFixed(2);

// Código de porcentaje IVA según ficha técnica SRI (tabla 17)
const ivaCode = (rate: number): string => {
	switch (Number(rate)) {
		case 0: return '0';
		case 5: return '5';
		case 12: return '2';
		case 13: return '10';
		case 14: return '3';
		case 15: return '4';
		default: return '4';
	}
};

const ddmmyyyy = (d: string | Date) => {
	const s = typeof d === 'string' ? d.slice(0, 10) : d.toISOString().slice(0, 10);
	const [y, m, day] = s.split('-');
	return `${day}/${m}/${y}`;
};

const tag = (name: string, value: any) => `<${name}>${esc(value)}</${name}>`;

/**
 * Genera el XML de factura (versión 1.1.0) en forma canónica: sin espacios entre
 * etiquetas ni etiquetas vacías autocerradas, requisito para que la firma sea válida.
 */
export function buildInvoiceXml(inv: InvoiceOrmEntity, company: CompanyOrmEntity): string {
	if (!company.address_matriz) {
		throw new Error('Completa la dirección de matriz de la empresa (Configuración > Empresas > Datos SRI).');
	}
	if (!/^\d{13}$/.test(company.ruc || '')) {
		throw new Error('El RUC de la empresa debe tener 13 dígitos.');
	}
	if (!inv.access_key || inv.access_key.length !== 49) {
		throw new Error('La factura no tiene clave de acceso válida.');
	}

	const details = inv.details || [];

	// Totales por tarifa de IVA
	const byRate = new Map<number, { base: number; tax: number }>();
	for (const d of details) {
		const rate = Number(d.tax_rate);
		const cur = byRate.get(rate) || { base: 0, tax: 0 };
		cur.base += Number(d.subtotal);
		cur.tax += Number(d.tax_value);
		byRate.set(rate, cur);
	}

	const totalImpuestos = [...byRate.entries()]
		.map(
			([rate, t]) =>
				`<totalImpuesto>${tag('codigo', '2')}${tag('codigoPorcentaje', ivaCode(rate))}` +
				`${tag('baseImponible', money(t.base))}${tag('valor', money(t.tax))}</totalImpuesto>`,
		)
		.join('');

	let rimpe = '';
	if (company.tax_regime === 'RIMPE_EMPRENDEDOR') {
		rimpe = tag('contribuyenteRimpe', 'CONTRIBUYENTE RÉGIMEN RIMPE');
	} else if (company.tax_regime === 'RIMPE_NEGOCIO_POPULAR') {
		rimpe = tag('contribuyenteRimpe', 'CONTRIBUYENTE NEGOCIO POPULAR - RÉGIMEN RIMPE');
	}

	const infoTributaria =
		`<infoTributaria>${tag('ambiente', company.sri_environment || '1')}${tag('tipoEmision', '1')}` +
		`${tag('razonSocial', company.business_name)}` +
		(company.trade_name ? tag('nombreComercial', company.trade_name) : '') +
		`${tag('ruc', company.ruc)}${tag('claveAcceso', inv.access_key)}${tag('codDoc', '01')}` +
		`${tag('estab', inv.establishment)}${tag('ptoEmi', inv.emission_point)}${tag('secuencial', inv.sequential)}` +
		`${tag('dirMatriz', company.address_matriz)}${rimpe}</infoTributaria>`;

	const isFinal = inv.customer_id_type === '07';
	const infoFactura =
		`<infoFactura>${tag('fechaEmision', ddmmyyyy(inv.issue_date))}` +
		`${tag('dirEstablecimiento', inv.branch_address || company.address_matriz)}` +
		(company.special_taxpayer ? tag('contribuyenteEspecial', company.special_taxpayer) : '') +
		`${tag('obligadoContabilidad', company.obligated_accounting ? 'SI' : 'NO')}` +
		`${tag('tipoIdentificacionComprador', inv.customer_id_type)}` +
		`${tag('razonSocialComprador', isFinal ? 'CONSUMIDOR FINAL' : inv.customer_name)}` +
		`${tag('identificacionComprador', isFinal ? '9999999999999' : inv.customer_id_number)}` +
		(inv.customer_address ? tag('direccionComprador', inv.customer_address) : '') +
		`${tag('totalSinImpuestos', money(inv.subtotal))}${tag('totalDescuento', money(inv.discount_total))}` +
		`<totalConImpuestos>${totalImpuestos}</totalConImpuestos>` +
		`${tag('propina', '0.00')}${tag('importeTotal', money(inv.total))}${tag('moneda', 'DOLAR')}` +
		`<pagos><pago>${tag('formaPago', inv.payment_method)}${tag('total', money(inv.total))}</pago></pagos></infoFactura>`;

	const detalles = details
		.map(
			(d, i) =>
				`<detalle>${tag('codigoPrincipal', d.code || `ITEM${i + 1}`)}${tag('descripcion', d.description)}` +
				`${tag('cantidad', Number(d.quantity).toFixed(4))}${tag('precioUnitario', Number(d.unit_price).toFixed(4))}` +
				`${tag('descuento', money(d.discount))}${tag('precioTotalSinImpuesto', money(d.subtotal))}` +
				`<impuestos><impuesto>${tag('codigo', '2')}${tag('codigoPorcentaje', ivaCode(Number(d.tax_rate)))}` +
				`${tag('tarifa', Number(d.tax_rate).toFixed(2))}${tag('baseImponible', money(d.subtotal))}` +
				`${tag('valor', money(d.tax_value))}</impuesto></impuestos></detalle>`,
		)
		.join('');

	const extras: string[] = [];
	if (inv.customer_email) extras.push(`<campoAdicional nombre="Email">${esc(inv.customer_email)}</campoAdicional>`);
	if (inv.customer_phone) extras.push(`<campoAdicional nombre="Telefono">${esc(inv.customer_phone)}</campoAdicional>`);
	if (inv.notes) extras.push(`<campoAdicional nombre="Observaciones">${esc(inv.notes)}</campoAdicional>`);
	const infoAdicional = extras.length ? `<infoAdicional>${extras.join('')}</infoAdicional>` : '';

	return (
		`<factura id="comprobante" version="1.1.0">${infoTributaria}${infoFactura}` +
		`<detalles>${detalles}</detalles>${infoAdicional}</factura>`
	);
}

/**
 * Genera el XML de Nota de Crédito (versión 1.1.0) conforme a la ficha técnica del SRI Ecuador.
 */
export function buildCreditNoteXml(cn: CreditNoteOrmEntity, company: CompanyOrmEntity): string {
	if (!company.address_matriz) {
		throw new Error('Completa la dirección de matriz de la empresa (Configuración > Empresas > Datos SRI).');
	}
	if (!/^\d{13}$/.test(company.ruc || '')) {
		throw new Error('El RUC de la empresa debe tener 13 dígitos.');
	}
	if (!cn.access_key || cn.access_key.length !== 49) {
		throw new Error('La nota de crédito no tiene clave de acceso válida.');
	}
	if (!cn.reason || !cn.reason.trim()) {
		throw new Error('El motivo de la nota de crédito es obligatorio según el SRI.');
	}
	if (!cn.modified_document_number) {
		throw new Error('El número del comprobante modificado es obligatorio.');
	}

	const details = cn.details || [];

	// Totales por tarifa de IVA
	const byRate = new Map<number, { base: number; tax: number }>();
	for (const d of details) {
		const rate = Number(d.tax_rate);
		const cur = byRate.get(rate) || { base: 0, tax: 0 };
		cur.base += Number(d.subtotal);
		cur.tax += Number(d.tax_value);
		byRate.set(rate, cur);
	}

	const totalImpuestos = [...byRate.entries()]
		.map(
			([rate, t]) =>
				`<totalImpuesto>${tag('codigo', '2')}${tag('codigoPorcentaje', ivaCode(rate))}` +
				`${tag('baseImponible', money(t.base))}${tag('valor', money(t.tax))}</totalImpuesto>`,
		)
		.join('');

	let rimpe = '';
	if (company.tax_regime === 'RIMPE_EMPRENDEDOR') {
		rimpe = tag('contribuyenteRimpe', 'CONTRIBUYENTE RÉGIMEN RIMPE');
	} else if (company.tax_regime === 'RIMPE_NEGOCIO_POPULAR') {
		rimpe = tag('contribuyenteRimpe', 'CONTRIBUYENTE NEGOCIO POPULAR - RÉGIMEN RIMPE');
	}

	const infoTributaria =
		`<infoTributaria>${tag('ambiente', company.sri_environment || '1')}${tag('tipoEmision', '1')}` +
		`${tag('razonSocial', company.business_name)}` +
		(company.trade_name ? tag('nombreComercial', company.trade_name) : '') +
		`${tag('ruc', company.ruc)}${tag('claveAcceso', cn.access_key)}${tag('codDoc', '04')}` +
		`${tag('estab', cn.establishment)}${tag('ptoEmi', cn.emission_point)}${tag('secuencial', cn.sequential)}` +
		`${tag('dirMatriz', company.address_matriz)}${rimpe}</infoTributaria>`;

	const isFinal = cn.customer_id_type === '07';
	const modDateStr = cn.modified_document_date ? ddmmyyyy(cn.modified_document_date) : ddmmyyyy(cn.issue_date);

	const infoNotaCredito =
		`<infoNotaCredito>${tag('fechaEmision', ddmmyyyy(cn.issue_date))}` +
		`${tag('dirEstablecimiento', cn.branch_address || company.address_matriz)}` +
		`${tag('tipoIdentificacionComprador', cn.customer_id_type)}` +
		`${tag('razonSocialComprador', isFinal ? 'CONSUMIDOR FINAL' : cn.customer_name)}` +
		`${tag('identificacionComprador', isFinal ? '9999999999999' : cn.customer_id_number)}` +
		(company.special_taxpayer ? tag('contribuyenteEspecial', company.special_taxpayer) : '') +
		`${tag('obligadoContabilidad', company.obligated_accounting ? 'SI' : 'NO')}` +
		`${tag('codDocModificado', cn.modified_document_type || '01')}` +
		`${tag('numDocModificado', cn.modified_document_number)}` +
		`${tag('fechaEmisionDocSustento', modDateStr)}` +
		`${tag('totalSinImpuestos', money(cn.subtotal))}` +
		`${tag('valorModificacion', money(cn.total))}` +
		`${tag('moneda', 'DOLAR')}` +
		`<totalConImpuestos>${totalImpuestos}</totalConImpuestos>` +
		`${tag('motivo', cn.reason.slice(0, 300))}</infoNotaCredito>`;

	const detalles = details
		.map(
			(d, i) =>
				`<detalle>${tag('codigoInterno', d.code || `ITEM${i + 1}`)}${tag('descripcion', d.description)}` +
				`${tag('cantidad', Number(d.quantity).toFixed(4))}${tag('precioUnitario', Number(d.unit_price).toFixed(4))}` +
				`${tag('descuento', money(d.discount))}${tag('precioTotalSinImpuesto', money(d.subtotal))}` +
				`<impuestos><impuesto>${tag('codigo', '2')}${tag('codigoPorcentaje', ivaCode(Number(d.tax_rate)))}` +
				`${tag('tarifa', Number(d.tax_rate).toFixed(2))}${tag('baseImponible', money(d.subtotal))}` +
				`${tag('valor', money(d.tax_value))}</impuesto></impuestos></detalle>`,
		)
		.join('');

	const extras: string[] = [];
	if (cn.customer_email) extras.push(`<campoAdicional nombre="Email">${esc(cn.customer_email)}</campoAdicional>`);
	if (cn.customer_phone) extras.push(`<campoAdicional nombre="Telefono">${esc(cn.customer_phone)}</campoAdicional>`);
	if (cn.notes) extras.push(`<campoAdicional nombre="Observaciones">${esc(cn.notes)}</campoAdicional>`);
	const infoAdicional = extras.length ? `<infoAdicional>${extras.join('')}</infoAdicional>` : '';

	return (
		`<notaCredito id="comprobante" version="1.1.0">${infoTributaria}${infoNotaCredito}` +
		`<detalles>${detalles}</detalles>${infoAdicional}</notaCredito>`
	);
}


