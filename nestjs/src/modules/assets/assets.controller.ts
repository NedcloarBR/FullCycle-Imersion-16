import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import { Asset } from '@prisma/client';
import { Services } from 'src/types/contants';
import { AssetsService } from './assets.service';

@Controller('assets')
export class AssetsController {
  constructor(
    @Inject(Services.Assets) private readonly assetsService: AssetsService,
  ) {}

  @Post()
  public async create(
    @Body() body: { id: string; symbol: string; price: number },
  ): Promise<Asset> {
    return await this.assetsService.create(body);
  }

  @Get()
  public async findAll(): Promise<Array<Asset>> {
    return await this.assetsService.findAll();
  }
}
