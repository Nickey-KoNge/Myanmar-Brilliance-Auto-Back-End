//src/modules/master-vehicle/vehicle-brands/dtos/update-vehicle-brands.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateVehicleBrandsDto } from './create-vehicle-brands.dto';

export class UpdateVehicleBrandsDto extends PartialType(
  CreateVehicleBrandsDto,
) {}
