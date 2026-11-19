import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import {
  WorkOrderRepository,
  ListWorkOrdersFilters,
  WorkOrderKpis,
} from '../../domain/repositories/work-order.repository';
import { WorkOrder, WorkOrderItem } from '../../domain/entities/work-order.entity';
import { WorkOrderOrmEntity } from '../persistence/work-order.orm-entity';
import { WorkOrderItemOrmEntity } from '../persistence/work-order-item.orm-entity';

// Clave del advisory lock de PostgreSQL que serializa la numeración de órdenes por empresa.
const WORK_ORDER_NUMBER_LOCK = 73011;

@Injectable()
export class WorkOrderRepositoryImpl implements WorkOrderRepository {
  constructor(
    @InjectRepository(WorkOrderOrmEntity)
    private readonly repo: Repository<WorkOrderOrmEntity>,
    @InjectRepository(WorkOrderItemOrmEntity)
    private readonly itemRepo: Repository<WorkOrderItemOrmEntity>,
  ) {}

  private toDomain(orm: WorkOrderOrmEntity): WorkOrder {
    const items: WorkOrderItem[] = (orm.items || []).map((i) => ({
      id: i.id,
      workOrderId: i.work_order_id,
      itemType: i.item_type,
      description: i.description,
      quantity: Number(i.quantity),
      unitPrice: Number(i.unit_price),
      subtotal: Number(i.subtotal),
    }));

    const customerDisplay =
      orm.customer_name ||
      (orm.customer
        ? (orm.customer as any).razon_social ||
          (orm.customer as any).nombre_comercial ||
          (orm.customer as any).name ||
          'Cliente'
        : 'Cliente');

    return new WorkOrder(
      orm.id,
      orm.company_id || orm.company?.id,
      orm.branch_id || orm.branch?.id || null,
      orm.customer_id || orm.customer?.id,
      customerDisplay,
      orm.customer_phone || (orm.customer as any)?.telefono || null,
      orm.customer_email || (orm.customer as any)?.email || null,
      orm.technician_id,
      orm.technician_name,
      orm.order_number,
      orm.service_type,
      orm.priority,
      orm.status,
      orm.equipment_type,
      orm.brand,
      orm.model,
      orm.serial_number,
      orm.color,
      orm.security_pin,
      orm.accessories,
      orm.physical_condition,
      orm.reported_failure,
      orm.technical_diagnosis,
      orm.solution_applied,
      orm.entry_date,
      orm.estimated_delivery_date,
      orm.real_delivery_date,
      orm.warranty_days,
      Number(orm.labor_cost),
      Number(orm.parts_cost),
      Number(orm.subtotal),
      Number(orm.tax_amount),
      Number(orm.total_amount),
      Number(orm.advance_payment),
      Number(orm.pending_balance),
      orm.notes,
      orm.deleted,
      orm.created_at,
      orm.updated_at,
      items,
      orm.branch?.name || null,
    );
  }

  async create(entity: WorkOrder, items: WorkOrderItem[] = []): Promise<WorkOrder> {
    // Numeración + alta en una sola transacción, serializada por empresa con un
    // advisory lock: dos altas concurrentes no pueden leer el mismo "último número".
    const savedId = await this.repo.manager.transaction(async (manager) => {
      await manager.query('SELECT pg_advisory_xact_lock($1::int, $2::int)', [
        WORK_ORDER_NUMBER_LOCK,
        entity.companyId,
      ]);
      const orderNumber = entity.orderNumber?.trim()
        ? entity.orderNumber.trim()
        : await this.generateNextOrderNumber(entity.companyId, manager);
      return this.insertWorkOrder(manager, entity, orderNumber, items);
    });

    return this.findById(savedId, entity.companyId) as Promise<WorkOrder>;
  }

  private async insertWorkOrder(
    manager: EntityManager,
    entity: WorkOrder,
    orderNumber: string,
    items: WorkOrderItem[],
  ): Promise<number> {
    const repo = manager.getRepository(WorkOrderOrmEntity);
    const itemRepo = manager.getRepository(WorkOrderItemOrmEntity);

    const orm = repo.create({
      company_id: entity.companyId,
      branch_id: entity.branchId,
      customer_id: entity.customerId,
      customer_name: entity.customerName,
      customer_phone: entity.customerPhone,
      customer_email: entity.customerEmail,
      technician_id: entity.technicianId,
      technician_name: entity.technicianName,
      order_number: orderNumber,
      service_type: entity.serviceType,
      priority: entity.priority,
      status: entity.status,
      equipment_type: entity.equipmentType,
      brand: entity.brand,
      model: entity.model,
      serial_number: entity.serialNumber,
      color: entity.color,
      security_pin: entity.securityPin,
      accessories: entity.accessories,
      physical_condition: entity.physicalCondition,
      reported_failure: entity.reportedFailure,
      technical_diagnosis: entity.technicalDiagnosis,
      solution_applied: entity.solutionApplied,
      entry_date: entity.entryDate,
      estimated_delivery_date: entity.estimatedDeliveryDate,
      real_delivery_date: entity.realDeliveryDate,
      warranty_days: entity.warrantyDays,
      labor_cost: entity.laborCost,
      parts_cost: entity.partsCost,
      subtotal: entity.subtotal,
      tax_amount: entity.taxAmount,
      total_amount: entity.totalAmount,
      advance_payment: entity.advancePayment,
      pending_balance: entity.pendingBalance,
      notes: entity.notes,
      deleted: false,
    });

    const saved = await repo.save(orm);

    if (items && items.length > 0) {
      const itemEntities = items.map((i) =>
        itemRepo.create({
          work_order_id: saved.id,
          item_type: i.itemType,
          description: i.description,
          quantity: i.quantity,
          unit_price: i.unitPrice,
          subtotal: i.subtotal,
        }),
      );
      await itemRepo.save(itemEntities);
    }

    return saved.id;
  }

  async findById(id: number, companyId: number): Promise<WorkOrder | null> {
    const found = await this.repo.findOne({
      where: { id, company_id: companyId, deleted: false },
      relations: ['customer', 'branch', 'items'],
    });
    return found ? this.toDomain(found) : null;
  }

  async findByCompany(
    companyId: number,
    filters: ListWorkOrdersFilters = {},
  ): Promise<{ data: WorkOrder[]; total: number; kpis: WorkOrderKpis }> {
    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 50;

    const queryBuilder = this.repo
      .createQueryBuilder('wo')
      .leftJoinAndSelect('wo.customer', 'customer')
      .leftJoinAndSelect('wo.branch', 'branch')
      .leftJoinAndSelect('wo.items', 'items')
      .where('wo.company_id = :companyId', { companyId })
      .andWhere('wo.deleted = false');

    if (filters.status) {
      queryBuilder.andWhere('wo.status = :status', { status: filters.status });
    }

    if (filters.serviceType) {
      queryBuilder.andWhere('wo.service_type = :serviceType', {
        serviceType: filters.serviceType,
      });
    }

    if (filters.priority) {
      queryBuilder.andWhere('wo.priority = :priority', { priority: filters.priority });
    }

    if (filters.branchId) {
      queryBuilder.andWhere('wo.branch_id = :branchId', {
        branchId: Number(filters.branchId),
      });
    }

    if (filters.technicianId) {
      queryBuilder.andWhere('wo.technician_id = :technicianId', {
        technicianId: Number(filters.technicianId),
      });
    }

    if (filters.startDate) {
      queryBuilder.andWhere('wo.entry_date >= :startDate', {
        startDate: `${filters.startDate} 00:00:00`,
      });
    }

    if (filters.endDate) {
      queryBuilder.andWhere('wo.entry_date <= :endDate', {
        endDate: `${filters.endDate} 23:59:59`,
      });
    }

    if (filters.search) {
      const q = `%${filters.search.toLowerCase().trim()}%`;
      queryBuilder.andWhere(
        '(LOWER(wo.order_number) LIKE :q OR LOWER(wo.customer_name) LIKE :q OR LOWER(customer.razon_social) LIKE :q OR LOWER(customer.nombre_comercial) LIKE :q OR LOWER(customer.num_document) LIKE :q OR LOWER(wo.equipment_type) LIKE :q OR LOWER(wo.brand) LIKE :q OR LOWER(wo.model) LIKE :q OR LOWER(wo.serial_number) LIKE :q OR LOWER(wo.reported_failure) LIKE :q)',
        { q },
      );
    }

    queryBuilder
      .orderBy('wo.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await queryBuilder.getManyAndCount();

    // KPIs consolidados por empresa
    const allForCompany = await this.repo.find({
      where: { company_id: companyId, deleted: false },
      select: ['id', 'status', 'pending_balance'],
    });

    const inProgressStatuses = [
      'EN_DIAGNOSTICO',
      'PRESUPUESTADO',
      'APROBADO',
      'EN_REPARACION',
      'EN_ESPERA_REPUESTOS',
    ];

    const kpis: WorkOrderKpis = {
      total: allForCompany.length,
      received: allForCompany.filter((o) => o.status === 'RECIBIDO').length,
      inProgress: allForCompany.filter((o) => inProgressStatuses.includes(o.status)).length,
      readyToDeliver: allForCompany.filter((o) => o.status === 'LISTO_ENTREGA').length,
      delivered: allForCompany.filter((o) => o.status === 'ENTREGADO').length,
      totalPendingAmount: allForCompany
        .filter((o) => o.status !== 'CANCELADO')
        .reduce((sum, o) => sum + (Number(o.pending_balance) || 0), 0),
    };

    return {
      data: items.map((i) => this.toDomain(i)),
      total,
      kpis,
    };
  }

  async update(entity: WorkOrder, items?: WorkOrderItem[]): Promise<WorkOrder> {
    const existing = await this.repo.findOne({
      where: { id: entity.id!, company_id: entity.companyId, deleted: false },
    });
    if (!existing) throw new NotFoundException('Orden de trabajo no encontrada');

    existing.branch_id = entity.branchId;
    existing.customer_id = entity.customerId;
    existing.customer_name = entity.customerName;
    existing.customer_phone = entity.customerPhone;
    existing.customer_email = entity.customerEmail;
    existing.technician_id = entity.technicianId;
    existing.technician_name = entity.technicianName;
    existing.service_type = entity.serviceType;
    existing.priority = entity.priority;
    existing.status = entity.status;
    existing.equipment_type = entity.equipmentType;
    existing.brand = entity.brand;
    existing.model = entity.model;
    existing.serial_number = entity.serialNumber;
    existing.color = entity.color;
    existing.security_pin = entity.securityPin;
    existing.accessories = entity.accessories;
    existing.physical_condition = entity.physicalCondition;
    existing.reported_failure = entity.reportedFailure;
    existing.technical_diagnosis = entity.technicalDiagnosis;
    existing.solution_applied = entity.solutionApplied;
    existing.entry_date = entity.entryDate;
    existing.estimated_delivery_date = entity.estimatedDeliveryDate;
    existing.real_delivery_date = entity.realDeliveryDate;
    existing.warranty_days = entity.warrantyDays;
    existing.labor_cost = entity.laborCost;
    existing.parts_cost = entity.partsCost;
    existing.subtotal = entity.subtotal;
    existing.tax_amount = entity.taxAmount;
    existing.total_amount = entity.totalAmount;
    existing.advance_payment = entity.advancePayment;
    existing.pending_balance = entity.pendingBalance;
    existing.notes = entity.notes;
    existing.updated_at = new Date();

    // Cabecera + reemplazo de ítems en una sola transacción: si falla la
    // inserción de los ítems nuevos no se pierden los anteriores.
    await this.repo.manager.transaction(async (manager) => {
      await manager.getRepository(WorkOrderOrmEntity).save(existing);

      if (items !== undefined) {
        const itemRepo = manager.getRepository(WorkOrderItemOrmEntity);
        await itemRepo.delete({ work_order_id: entity.id! });
        if (items.length > 0) {
          const itemEntities = items.map((i) =>
            itemRepo.create({
              work_order_id: entity.id!,
              item_type: i.itemType,
              description: i.description,
              quantity: i.quantity,
              unit_price: i.unitPrice,
              subtotal: i.subtotal,
            }),
          );
          await itemRepo.save(itemEntities);
        }
      }
    });

    return this.findById(entity.id!, entity.companyId) as Promise<WorkOrder>;
  }

  async updateStatus(
    id: number,
    companyId: number,
    status: string,
    technicalDiagnosis?: string,
    solutionApplied?: string,
    realDeliveryDate?: Date,
    notes?: string | null,
  ): Promise<WorkOrder> {
    const existing = await this.repo.findOne({
      where: { id, company_id: companyId, deleted: false },
    });
    if (!existing) throw new NotFoundException('Orden de trabajo no encontrada');

    existing.status = status;
    if (technicalDiagnosis !== undefined) existing.technical_diagnosis = technicalDiagnosis;
    if (solutionApplied !== undefined) existing.solution_applied = solutionApplied;
    if (realDeliveryDate !== undefined) existing.real_delivery_date = realDeliveryDate;
    if (notes !== undefined) existing.notes = notes;
    existing.updated_at = new Date();

    await this.repo.save(existing);
    return this.findById(id, companyId) as Promise<WorkOrder>;
  }

  async delete(id: number, companyId: number): Promise<void> {
    await this.repo.update({ id, company_id: companyId }, { deleted: true });
  }

  async generateNextOrderNumber(companyId: number, manager?: EntityManager): Promise<string> {
    const repo = manager ? manager.getRepository(WorkOrderOrmEntity) : this.repo;
    const latest = await repo.findOne({
      where: { company_id: companyId },
      order: { id: 'DESC' },
    });

    let nextNumber = 1;
    if (latest && latest.order_number) {
      const match = latest.order_number.match(/(\d+)$/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }

    return `OT-${String(nextNumber).padStart(4, '0')}`;
  }
}
