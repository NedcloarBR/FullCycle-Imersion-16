import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';
import { Services } from 'src/types/contants';
import { IWalletsAssetsService } from 'src/types/services';

@Controller('wallets/:walled_id/assets')
export class WalletsAssetsController {
  public constructor(
    @Inject(Services.WalletsAssets)
    private readonly walletAssetsService: IWalletsAssetsService,
  ) {}

  @Post()
  public async create(
    @Param('wallet_id') wallet_id: string,
    @Body() body: { asset_id: string; shares: number },
  ) {
    return this.walletAssetsService.create({
      wallet_id,
      ...body,
    });
  }

  @Get()
  public async findAll(@Param('wallet_id') wallet_id: string) {
    return this.walletAssetsService.findAll({ id: wallet_id });
  }
}
