import { Global, Module } from '@nestjs/common';
import { Services } from 'src/types/contants';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [
    {
      provide: Services.Prisma,
      useClass: PrismaService,
    },
  ],
  exports: [
    {
      provide: Services.Prisma,
      useClass: PrismaService,
    },
  ],
})
export class PrismaModule {}
