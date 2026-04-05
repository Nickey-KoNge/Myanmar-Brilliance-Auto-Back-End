//src/modules/master-vehicle/vehicle-model/dtos/create-vehicle-model.dto.ts
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateVehicleModelDto {
  @IsString()
  @IsNotEmpty()
  vehicle_model_name!: string;

  @IsString()
  @IsNotEmpty()
  vehicle_brand_id!: string;

  @IsString()
  @IsNotEmpty()
  body_type!: string;

  @IsString()
  @IsNotEmpty()
  fuel_type!: string;

  @IsString()
  @IsNotEmpty()
  transmission!: string;

  @IsString()
  @IsNotEmpty()
  engine_capacity!: string;

  @IsString()
  @IsNotEmpty()
  year_of_release!: Date;

  @IsOptional()
  status?: string;
}
