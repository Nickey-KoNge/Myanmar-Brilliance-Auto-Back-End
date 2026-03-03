// src/common/common.module.ts
import { Global, Module } from '@nestjs/common';
import { OpService } from './service/op.service';
import { ImgFileService } from './service/imgfile.service';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [OpService, ImgFileService],
  exports: [OpService, ImgFileService],
})
export class CommonModule {}
