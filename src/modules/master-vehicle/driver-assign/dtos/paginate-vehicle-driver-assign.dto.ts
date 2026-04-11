// src/modules/master-vehicle/driver-assign/dtos/paginate-vehicle-driver-assign.dto.ts
import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, IsString } from 'class-validator';

export class PaginateVehicleDriverAssignDto {
  // --- Pagination ---
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
  lastId?: string;

  // --- Search & Filters ---
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  driver_id?: string;

  @IsOptional()
  @IsString()
  vehicle_id?: string;

  @IsOptional()
  @IsString()
  station_id?: string;

  @IsOptional()
  @IsString()
  status?: string;

  // --- Dates Filtering ---
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
