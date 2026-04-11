//src/modules/master-vehicle/vehicle/dtos/create-vehicle.dto.ts
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateVehicleDto {
  @IsNotEmpty()
  @IsString()
  vehicle_name!: string;

  @IsNotEmpty()
  @IsString()
  vehicle_model_id!: string;

  @IsNotEmpty()
  @IsString()
  license_plate!: string;

  @IsOptional()
  @IsString()
  station_id?: string;

  @IsOptional()
  @IsString()
  group_id?: string;

  @IsOptional()
  @IsString()
  supplier_id?: string;

  @IsOptional()
  @IsString()
  city_taxi_no?: string;

  @IsOptional()
  @IsString()
  serial_no?: string;

  @IsOptional()
  @IsString()
  vin_no?: string;

  @IsOptional()
  @IsString()
  engine_no?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  license_type?: string;

  @IsOptional()
  @IsString()
  current_odometer?: string;

  @IsOptional()
  @IsString()
  vehicle_license_exp?: string;

  @IsOptional()
  @IsString()
  service_intervals?: string;

  @IsOptional()
  @IsString()
  purchase_date?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
