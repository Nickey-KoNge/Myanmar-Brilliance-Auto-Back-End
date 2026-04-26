import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginateTripPriceDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  route_id?: string;

  @IsOptional()
  @IsString()
  vehicle_model_id?: string;

  @IsOptional()
  @IsString()
  station_id?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
