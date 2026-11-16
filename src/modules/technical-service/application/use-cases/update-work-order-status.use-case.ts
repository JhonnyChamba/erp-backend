import { Injectable, NotFoundException } from '@nestjs/common';
import { WorkOrderRepository } from '../../domain/repositories/work-order.repository';
import { WorkOrder } from '../../domain/entities/work-order.entity';
import { UpdateWorkOrderStatusDto } from '../dto/update-work-order-status.dto';

@Injectable()
export class UpdateWorkOrderStatusUseCase {
  constructor(private readonly repository: WorkOrderRepository) {}

  async execute(
    id: number,
    companyId: number,
    dto: UpdateWorkOrderStatusDto,
  ): Promise<WorkOrder> {
    const existing = await this.repository.findById(id, companyId);
    if (!existing) throw new NotFoundException('Orden de trabajo no encontrada');

    let realDeliveryDate: Date | undefined = undefined;
    if (dto.status === 'ENTREGADO') {
      realDeliveryDate = dto.realDeliveryDate ? new Date(dto.realDeliveryDate) : new Date();
    }

    return this.repository.updateStatus(
      id,
      companyId,
      dto.status,
      dto.technicalDiagnosis,
      dto.solutionApplied,
      realDeliveryDate,
    );
  }
}
