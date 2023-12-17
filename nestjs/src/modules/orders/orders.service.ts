import { Inject, Injectable } from '@nestjs/common';
import { Order, OrderStatus, OrderType } from '@prisma/client';
import { Services } from 'src/types/contants';
import { IOrdersService } from 'src/types/services';
import { PrismaService } from '../prisma/prisma.service';
import { ExecuteTransactionDTO, InitTransactionDTO } from './order.dto';

@Injectable()
export class OrdersService implements IOrdersService {
  public constructor(
    @Inject(Services.Prisma) private readonly prisma: PrismaService,
  ) {}

  public async findAll(wallet_id: string): Promise<Array<Order>> {
    return await this.prisma.order.findMany({
      where: {
        wallet_id,
      },
      include: {
        Transactions: true,
        Asset: {
          select: {
            id: true,
            symbol: true,
          },
        },
      },
      orderBy: {
        updated_at: 'desc',
      },
    });
  }

  public async initTransaction(data: InitTransactionDTO): Promise<Order> {
    return this.prisma.order.create({
      data: {
        ...data,
        status: OrderStatus.PENDING,
        partial: data.shares,
      },
    });
  }

  public async executeTransaction(data: ExecuteTransactionDTO): Promise<void> {
    return await this.prisma.$transaction(async (prisma) => {
      const order = await prisma.order.findUniqueOrThrow({
        where: { id: data.order_id },
      });

      await prisma.order.update({
        where: { id: data.order_id },
        data: {
          partial: order.partial - data.negotiated_shares,
          status: data.status,
          Transactions: {
            create: {
              broker_transaction_id: data.broker_transaction_id,
              related_investor_id: data.related_investor_id,
              shares: data.negotiated_shares,
              price: data.price,
            },
          },
        },
      });
      if (data.status === OrderStatus.CLOSED) {
        await prisma.asset.update({
          where: { id: order.asset_id },
          data: {
            price: data.price,
          },
        });
        const walletAsset = await prisma.walletAsset.findUnique({
          where: {
            wallet_id_asset_id: {
              asset_id: order.asset_id,
              wallet_id: order.wallet_id,
            },
          },
        });
        if (walletAsset) {
          await prisma.walletAsset.update({
            where: {
              wallet_id_asset_id: {
                asset_id: order.asset_id,
                wallet_id: order.wallet_id,
              },
            },
            data: {
              shares:
                order.type === OrderType.BUY
                  ? walletAsset.shares + order.shares
                  : walletAsset.shares - order.shares,
            },
          });
        } else {
          await prisma.walletAsset.create({
            data: {
              asset_id: order.asset_id,
              wallet_id: order.wallet_id,
              shares: data.negotiated_shares,
            },
          });
        }
      }
    });
  }
}
