import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CompanyAccessGuard } from 'src/auth/guards/company-access.guard';
import { CreateWorkOrderUseCase } from '../application/use-cases/create-work-order.use-case';
import { ListWorkOrdersUseCase } from '../application/use-cases/list-work-orders.use-case';
import { GetWorkOrderUseCase } from '../application/use-cases/get-work-order.use-case';
import { UpdateWorkOrderUseCase } from '../application/use-cases/update-work-order.use-case';
import { UpdateWorkOrderStatusUseCase } from '../application/use-cases/update-work-order-status.use-case';
import { DeleteWorkOrderUseCase } from '../application/use-cases/delete-work-order.use-case';
import { CreateWorkOrderDto } from '../application/dto/create-work-order.dto';
import { UpdateWorkOrderDto } from '../application/dto/update-work-order.dto';
import { ListWorkOrdersDto } from '../application/dto/list-work-orders.dto';
import { UpdateWorkOrderStatusDto } from '../application/dto/update-work-order-status.dto';
import { WorkOrderRepository } from '../domain/repositories/work-order.repository';

@UseGuards(AuthGuard('jwt'), CompanyAccessGuard)
@Controller('technical-service')
export class WorkOrderController {
  constructor(
    private readonly createUseCase: CreateWorkOrderUseCase,
    private readonly listUseCase: ListWorkOrdersUseCase,
    private readonly getUseCase: GetWorkOrderUseCase,
    private readonly updateUseCase: UpdateWorkOrderUseCase,
    private readonly updateStatusUseCase: UpdateWorkOrderStatusUseCase,
    private readonly deleteUseCase: DeleteWorkOrderUseCase,
    private readonly repository: WorkOrderRepository,
  ) {}

  @Post()
  create(@Body() dto: CreateWorkOrderDto, @Req() req: any) {
    const companyId = req.companyId || req.user?.companyId || 1;
    return this.createUseCase.execute({ ...dto, companyId }, req.user);
  }

  @Get()
  list(@Query() query: ListWorkOrdersDto, @Req() req: any) {
    const companyId = req.companyId || req.user?.companyId || 1;
    return this.listUseCase.execute(companyId, query);
  }

  @Get('next-number')
  async getNextNumber(@Req() req: any) {
    const companyId = req.companyId || req.user?.companyId || 1;
    const orderNumber = await this.repository.generateNextOrderNumber(companyId);
    return { orderNumber };
  }

  @Get(':id')
  get(@Param('id') id: number, @Req() req: any) {
    const companyId = req.companyId || req.user?.companyId || 1;
    return this.getUseCase.execute(Number(id), companyId);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() dto: UpdateWorkOrderDto,
    @Req() req: any,
  ) {
    const companyId = req.companyId || req.user?.companyId || 1;
    return this.updateUseCase.execute(Number(id), companyId, dto);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: number,
    @Body() dto: UpdateWorkOrderStatusDto,
    @Req() req: any,
  ) {
    const companyId = req.companyId || req.user?.companyId || 1;
    return this.updateStatusUseCase.execute(Number(id), companyId, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: number, @Req() req: any) {
    const companyId = req.companyId || req.user?.companyId || 1;
    return this.deleteUseCase.execute(Number(id), companyId);
  }
}
