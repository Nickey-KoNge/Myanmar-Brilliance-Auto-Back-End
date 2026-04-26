import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class CreateTripPriceDto {
  @IsUUID()
  @IsNotEmpty()
  route_id!: string;

  @IsUUID()
  @IsNotEmpty()
  vehicle_model_id!: string;

  @IsUUID()
  @IsNotEmpty()
  station_id!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  daily_trip_rate!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  overnight_trip_rate!: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  status?: string;
}
