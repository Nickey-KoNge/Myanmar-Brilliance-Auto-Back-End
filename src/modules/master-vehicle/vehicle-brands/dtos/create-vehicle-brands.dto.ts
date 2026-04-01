//src/modules/master-vehicle/vehicle-brands/dtos/create-vehicle-brands.dto.ts
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateVehicleBrandsDto {
  @IsString()
  @IsNotEmpty()
  vehicle_brand_name: string;

  @IsString()
  @IsNotEmpty()
  country_of_origin: string;

  @IsString()
  @IsNotEmpty()
  manufacturer: string;

  @IsOptional()
  image?: any;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  status?: string;
}
