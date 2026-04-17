import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  IsUUID,
  IsDateString,
} from 'class-validator';

export class CreateRentalOperationDto {
  @IsUUID()
  @IsNotEmpty()
  route_id!: string;

  @IsUUID()
  @IsNotEmpty()
  vehicle_id!: string;

  @IsUUID()
  @IsNotEmpty()
  driver_id!: string;

  @IsUUID()
  @IsNotEmpty()
  station_id!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2)
  daily_count?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @IsOptional()
  @IsDateString()
  start_time?: string;

  @IsOptional()
  @IsDateString()
  end_time?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  start_odo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  end_odo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(3)
  start_battery?: string;

  @IsOptional()
  @IsString()
  @MaxLength(3)
  end_battery?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2)
  extra_hours?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2)
  overnight_count?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  trip_status?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5)
  distance?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  power_station_name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  kw?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  amount?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  status?: string;
}
