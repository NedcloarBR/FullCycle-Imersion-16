import { Inject, Injectable } from '@nestjs/common';
import { Asset } from '@prisma/client';
import { Services } from 'src/types/contants';
import { IAssetsService } from 'src/types/services';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AssetsService implements IAssetsService {
  public constructor(
    @Inject(Services.Prisma) private readonly prisma: PrismaService,
  ) {}

  public async create(data: {
    id: string;
    symbol: string;
    price: number;
  }): Promise<Asset> {
    return await this.prisma.asset.create({
      data,
    });
  }

  public async findAll() {
    return await this.prisma.asset.findMany();
  }
}
