import { Module } from '@nestjs/common';
import { AssetsModule } from './modules/assets/assets.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { WalletsModule } from './modules/wallets/wallets.module';

@Module({
  imports: [AssetsModule, OrdersModule, PrismaModule, WalletsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
