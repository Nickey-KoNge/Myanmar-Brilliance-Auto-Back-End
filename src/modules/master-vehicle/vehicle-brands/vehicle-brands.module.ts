import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehicleBrands } from './entities/vehicle-brands.entity';
import { VehicleBrandsController } from './vehicle-brands.controller';
import { VehicleBrandsService } from './vehicle-brands.service';
import { FileServiceProvider } from 'src/common/service/file.service';
import { OptimizeImageService } from 'src/common/service/optimize-image.service';
import { MasterAuditModule } from 'src/modules/master-audit/audit/audit.module';

@Module({
  imports: [TypeOrmModule.forFeature([VehicleBrands]), MasterAuditModule],
  controllers: [VehicleBrandsController],
  providers: [VehicleBrandsService, FileServiceProvider, OptimizeImageService],
  exports: [VehicleBrandsService],
})
export class MasterVehicleBrandsModule {}
