//src/modules/master-vehicle/driver-assign/dtos/update-vehicle-driver-assign.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateVehicleDriverAssignDto } from './create-vehicle-driver-assign.dto';

export class UpdateVehicleDriverDto extends PartialType(
  CreateVehicleDriverAssignDto,
) {}
