import { Inject, Injectable } from '@nestjs/common';
import { Wallet } from '@prisma/client';
import { Services } from 'src/types/contants';
import { IWalletsService } from 'src/types/services';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WalletsService implements IWalletsService {
  public constructor(
    @Inject(Services.Prisma) private readonly prisma: PrismaService,
  ) {}

  public async create(data: { id: string }): Promise<Wallet> {
    return await this.prisma.wallet.create({
      data,
    });
  }

  public async findAll(): Promise<Array<Wallet>> {
    return await this.prisma.wallet.findMany();
  }
}
