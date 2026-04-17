import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vehicle } from '../vehicle/entities/vehicle.entity';
import { Driver } from '../../master-company/driver/entities/driver.entity';
import { VehicleDriverAssignService } from './vehicle-driver-assign.service';
import { VehicleDriverAssignController } from './vehicle-driver-assign.controller';
import { VehicleDriverAssign } from './entities/vehicle-driver-assign.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Driver, Vehicle, VehicleDriverAssign])],
  controllers: [VehicleDriverAssignController],
  providers: [VehicleDriverAssignService],
  exports: [VehicleDriverAssignService],
})
export class MasterVehicleDriverAssignModule {}
