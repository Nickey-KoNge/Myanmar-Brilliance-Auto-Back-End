import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class CreateRouteTripPriceDto {
  @IsString()
  @IsNotEmpty()
  vehicle_model_id!: string;

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

export class CreateRouteDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  route_name!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  start_location!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  end_location!: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  status?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRouteTripPriceDto)
  trip_prices?: CreateRouteTripPriceDto[];
}
