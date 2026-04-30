import { IsString, IsArray, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class TripPriceEntryDto {
  @IsString()
  @IsNotEmpty()
  vehicle_model_id!: string;

  @IsString()
  @IsNotEmpty()
  daily_trip_rate!: string;

  @IsString()
  @IsNotEmpty()
  overnight_trip_rate!: string;
}

export class BulkCreateTripPriceDto {
  @IsString()
  @IsNotEmpty()
  route_id!: string;

  @IsString()
  @IsNotEmpty()
  station_id!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TripPriceEntryDto)
  prices!: TripPriceEntryDto[];
}
