import { Module } from '@nestjs/common';
import { Services } from 'src/types/contants';
import { AssetsController } from './assets.controller';
import { AssetsService } from './assets.service';

@Module({
  controllers: [AssetsController],
  providers: [
    {
      provide: Services.Assets,
      useClass: AssetsService,
    },
  ],
})
export class AssetsModule {}
