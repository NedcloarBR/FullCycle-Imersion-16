import { Module } from '@nestjs/common';
import { Services } from 'src/types/contants';
import { WalletsAssetsController } from './wallets-assets/wallets-assets.controller';
import { WalletsAssetsService } from './wallets-assets/wallets-assets.service';
import { WalletsController } from './wallets.controller';
import { WalletsService } from './wallets.service';

@Module({
  controllers: [WalletsController, WalletsAssetsController],
  providers: [
    {
      provide: Services.Wallets,
      useClass: WalletsService,
    },
    {
      provide: Services.WalletsAssets,
      useClass: WalletsAssetsService,
    },
  ],
})
export class WalletsModule {}
