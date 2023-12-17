import { Module } from '@nestjs/common';
import { Services } from 'src/types/contants';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  controllers: [OrdersController],
  providers: [
    {
      provide: Services.Orders,
      useClass: OrdersService,
    },
  ],
})
export class OrdersModule {}
