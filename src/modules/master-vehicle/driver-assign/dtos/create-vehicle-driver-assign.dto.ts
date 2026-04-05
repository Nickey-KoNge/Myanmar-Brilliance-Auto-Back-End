//src/modules/master-vehicle/driver-assign/dtos/create-vehicle-driver-assign.dto.ts
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateVehicleDriverAssignDto {
  @IsNotEmpty()
  @IsString()
  driver_id!: string;

  @IsNotEmpty()
  @IsString()
  vehicle_id!: string;

  @IsOptional()
  @IsString()
  station_id?: string;

  @IsOptional()
  @IsDateString()
  assigned_at?: string;

  @IsOptional()
  @IsDateString()
  returned_at?: string;

  @IsOptional()
  @IsString()
  start_odometer?: string;

  @IsOptional()
  @IsString()
  end_odometer?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
