import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';
import { Order } from '@prisma/client';
import { Services } from 'src/types/contants';
import { ExecuteTransactionDTO, InitTransactionDTO } from './order.dto';
import { OrdersService } from './orders.service';

@Controller('wallets/:wallet_id/orders')
export class OrdersController {
  public constructor(
    @Inject(Services.Orders) private readonly ordersService: OrdersService,
  ) {}

  @Get()
  public async findAll(
    @Param('wallet_id') wallet_id: string,
  ): Promise<Array<Order>> {
    return await this.ordersService.findAll(wallet_id);
  }

  @Post()
  public async initTransaction(
    @Param('wallet_id') wallet_id: string,
    @Body() body: Omit<InitTransactionDTO, 'wallet_id'>,
  ): Promise<Order> {
    return await this.ordersService.initTransaction({ ...body, wallet_id });
  }

  @Post('execute')
  public async executeTransaction(
    @Body() body: ExecuteTransactionDTO,
  ): Promise<void> {
    return await this.ordersService.executeTransaction(body);
  }
}
