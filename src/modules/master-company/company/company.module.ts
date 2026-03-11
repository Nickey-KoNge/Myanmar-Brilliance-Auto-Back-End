import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Company } from './entities/company.entity';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { FileServiceProvider } from '../../../common/service/file.service';
import { OptimizeImageService } from '../../../common/service/optimize-image.service';

@Module({
  imports: [TypeOrmModule.forFeature([Company])],
  controllers: [CompanyController],
  providers: [CompanyService, FileServiceProvider, OptimizeImageService],
})
export class CompanyModule {}
