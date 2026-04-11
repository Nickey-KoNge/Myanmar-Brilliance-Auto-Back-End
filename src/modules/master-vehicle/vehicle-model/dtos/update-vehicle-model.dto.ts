//src/modules/master-vehicle/vehicle-model/dtos/update-vehicle-model.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateVehicleModelDto } from './create-vehicle-model.dto';

export class UpdateVehicleModelDto extends PartialType(CreateVehicleModelDto) {}
