import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkOrderOrmEntity } from './infrastructure/persistence/work-order.orm-entity';
import { WorkOrderItemOrmEntity } from './infrastructure/persistence/work-order-item.orm-entity';
import { WorkOrderRepository } from './domain/repositories/work-order.repository';
import { WorkOrderRepositoryImpl } from './infrastructure/repositories/work-order.repository.impl';
import { CreateWorkOrderUseCase } from './application/use-cases/create-work-order.use-case';
import { ListWorkOrdersUseCase } from './application/use-cases/list-work-orders.use-case';
import { GetWorkOrderUseCase } from './application/use-cases/get-work-order.use-case';
import { UpdateWorkOrderUseCase } from './application/use-cases/update-work-order.use-case';
import { UpdateWorkOrderStatusUseCase } from './application/use-cases/update-work-order-status.use-case';
import { DeleteWorkOrderUseCase } from './application/use-cases/delete-work-order.use-case';
import { WorkOrderController } from './presentation/work-order.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WorkOrderOrmEntity,
      WorkOrderItemOrmEntity,
    ]),
  ],
  controllers: [WorkOrderController],
  providers: [
    {
      provide: WorkOrderRepository,
      useClass: WorkOrderRepositoryImpl,
    },
    CreateWorkOrderUseCase,
    ListWorkOrdersUseCase,
    GetWorkOrderUseCase,
    UpdateWorkOrderUseCase,
    UpdateWorkOrderStatusUseCase,
    DeleteWorkOrderUseCase,
  ],
  exports: [WorkOrderRepository, GetWorkOrderUseCase],
})
export class TechnicalServiceModule {}
