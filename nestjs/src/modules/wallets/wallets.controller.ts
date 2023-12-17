import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import { Wallet } from '@prisma/client';
import { Services } from 'src/types/contants';
import { IWalletsService } from 'src/types/services';

@Controller('wallets')
export class WalletsController {
  public constructor(
    @Inject(Services.Wallets) private readonly walletsService: IWalletsService,
  ) {}

  @Post()
  public async create(@Body() body: { id: string }): Promise<Wallet> {
    return await this.walletsService.create(body);
  }

  @Get()
  public async findAll(): Promise<Array<Wallet>> {
    return await this.walletsService.findAll();
  }
}
