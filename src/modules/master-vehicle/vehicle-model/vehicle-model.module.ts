// src/modules/master-vehicle/vehicle-model/vehicle-model.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehicleModelService } from './vehicle-model.service';
import { VehicleModelController } from './vehicle-model.controller';
import { VehicleModels } from './entities/vehicle-model.entity';
import { MasterAuditModule } from 'src/modules/master-audit/audit/audit.module';

@Module({
  imports: [TypeOrmModule.forFeature([VehicleModels]), MasterAuditModule],
  controllers: [VehicleModelController],
  providers: [VehicleModelService],
  exports: [VehicleModelService],
})
export class MasterVehicleModelModule {}
