import Decimal from 'decimal.js';
import { InventoryService } from './inventory.service';

describe('InventoryService - Motor Central de Inventarios', () => {
	let service: InventoryService;

	beforeEach(() => {
		// Mock de repositorios y dataSource
		const mockRepo = {
			find: jest.fn(),
			findOne: jest.fn(),
			create: jest.fn((e) => e),
			save: jest.fn((e) => Promise.resolve(e)),
			count: jest.fn(),
			update: jest.fn(),
		} as any;

		const mockDataSource = {
			transaction: jest.fn((cb) => cb(mockRepo)),
		} as any;

		service = new InventoryService(
			mockRepo,
			mockRepo,
			mockRepo,
			mockRepo,
			mockRepo,
			mockRepo,
			mockRepo,
			mockRepo,
			mockDataSource,
		);
	});

	describe('calculateAverageCost', () => {
		it('debe calcular el costo promedio ponderado exacto cuando hay stock previo', () => {
			// Stock actual: 10 unidades a $10.00 = $100
			// Entrada: 5 unidades a $16.00 = $80
			// Total esperado: 15 unidades a ($180 / 15) = $12.00
			const currStock = new Decimal(10);
			const currAvgCost = new Decimal(10);
			const entryQty = new Decimal(5);
			const entryCost = new Decimal(16);

			const avgCost = service.calculateAverageCost(currStock, currAvgCost, entryQty, entryCost);
			expect(avgCost.toNumber()).toBe(12);
		});

		it('debe asignar el costo de entrada cuando el stock inicial es 0', () => {
			const currStock = new Decimal(0);
			const currAvgCost = new Decimal(0);
			const entryQty = new Decimal(20);
			const entryCost = new Decimal(45.5);

			const avgCost = service.calculateAverageCost(currStock, currAvgCost, entryQty, entryCost);
			expect(avgCost.toNumber()).toBe(45.5);
		});

		it('debe mantener alta precisión decimal sin pérdidas por punto flotante binario', () => {
			// 100 unidades a 0.1 + 200 unidades a 0.2
			const currStock = new Decimal(100);
			const currAvgCost = new Decimal(0.1);
			const entryQty = new Decimal(200);
			const entryCost = new Decimal(0.2);

			const avgCost = service.calculateAverageCost(currStock, currAvgCost, entryQty, entryCost);
			// Total: (10 + 40) / 300 = 50 / 300 = 0.166666666666...
			expect(avgCost.toDecimalPlaces(4).toNumber()).toBe(0.1667);
		});
	});
});
