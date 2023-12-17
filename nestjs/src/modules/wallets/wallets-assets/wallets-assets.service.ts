import { Inject, Injectable } from '@nestjs/common';
import { WalletAsset } from '@prisma/client';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { Services } from 'src/types/contants';
import { IWalletsAssetsService } from 'src/types/services';

@Injectable()
export class WalletsAssetsService implements IWalletsAssetsService {
  public constructor(
    @Inject(Services.Prisma) private readonly prisma: PrismaService,
  ) {}

  public async create(data: {
    wallet_id: string;
    asset_id: string;
    shares: number;
  }): Promise<WalletAsset> {
    return await this.prisma.walletAsset.create({
      data,
    });
  }

  public async findAll(data: { id: string }): Promise<Array<WalletAsset>> {
    return await this.prisma.walletAsset.findMany({
      where: {
        wallet_id: data.id,
      },
      include: {
        Asset: true,
      },
    });
  }
}
