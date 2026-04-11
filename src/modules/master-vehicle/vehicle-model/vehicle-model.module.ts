// src/modules/master-vehicle/vehicle-model/vehicle-model.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehicleModelService } from './vehicle-model.service';
import { VehicleModelController } from './vehicle-model.controller';
import { VehicleModels } from './entities/vehicle-model.entity';

@Module({
  imports: [TypeOrmModule.forFeature([VehicleModels])],
  controllers: [VehicleModelController],
  providers: [VehicleModelService],
  exports: [VehicleModelService],
})
export class VehicleModelModule {}
