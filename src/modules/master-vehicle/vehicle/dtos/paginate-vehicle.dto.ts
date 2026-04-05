// src/modules/master-vehicle/vehicle/dtos/paginate-vehicle.dto.ts
import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, IsString } from 'class-validator';

export class PaginateVehicleDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  lastId?: string;

  // --- Vehicle Specific Filters ---
  @IsOptional()
  @IsString()
  station_id?: string;

  @IsOptional()
  @IsString()
  group_id?: string;

  @IsOptional()
  @IsString()
  vehicle_model_id?: string;

  @IsOptional()
  @IsString()
  supplier_id?: string;

  @IsOptional()
  @IsString()
  status?: string;

  // --- Dates Pagination & Filtering ---
  @IsOptional()
  @IsString()
  lastCreatedAt?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;
}
