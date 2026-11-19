// REPUESTO suma a partsCost; el resto (mano de obra, servicio, otro) suma a laborCost.
export type WorkOrderItemType = 'REPUESTO' | 'MANO_OBRA' | 'SERVICIO' | 'OTRO';

export interface WorkOrderItem {
  id?: number | null;
  workOrderId?: number;
  itemType: WorkOrderItemType;
  description: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export class WorkOrder {
  constructor(
    public readonly id: number | null,
    public companyId: number,
    public branchId: number | null,
    public customerId: number,
    public customerName: string | null,
    public customerPhone: string | null,
    public customerEmail: string | null,
    public technicianId: number | null,
    public technicianName: string | null,
    public orderNumber: string,
    public serviceType: string, // REPARACION, MANTENIMIENTO_PREVENTIVO, MANTENIMIENTO_CORRECTIVO, DIAGNOSTICO, GARANTIA
    public priority: string, // BAJA, MEDIA, ALTA, URGENTE
    public status: string, // RECIBIDO, EN_DIAGNOSTICO, PRESUPUESTADO, APROBADO, EN_REPARACION, EN_ESPERA_REPUESTOS, LISTO_ENTREGA, ENTREGADO, CANCELADO
    public equipmentType: string, // Laptop, PC Escritorio, Smartphone, Tablet, Impresora, Consola, Otro
    public brand: string | null,
    public model: string | null,
    public serialNumber: string | null,
    public color: string | null,
    public securityPin: string | null,
    public accessories: string | null,
    public physicalCondition: string | null,
    public reportedFailure: string,
    public technicalDiagnosis: string | null,
    public solutionApplied: string | null,
    public entryDate: Date,
    public estimatedDeliveryDate: Date | null,
    public realDeliveryDate: Date | null,
    public warrantyDays: number = 30,
    public laborCost: number = 0.0,
    public partsCost: number = 0.0,
    public subtotal: number = 0.0,
    public taxAmount: number = 0.0,
    public totalAmount: number = 0.0,
    public advancePayment: number = 0.0,
    public pendingBalance: number = 0.0,
    public notes: string | null = null,
    public deleted: boolean = false,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
    public items: WorkOrderItem[] = [],
    public branchName?: string | null,
  ) {}
}
