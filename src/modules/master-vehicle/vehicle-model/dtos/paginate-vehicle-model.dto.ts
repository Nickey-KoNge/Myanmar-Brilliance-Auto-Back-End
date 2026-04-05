// src\modules\master-vehicle\vehicle-model\dtos\paginate-vehicle-model.dto.ts
import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, IsString } from 'class-validator';

export class PaginateVehicleModelDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  lastId?: string;

  @IsOptional()
  @IsString()
  vehicle_brand_id?: string;

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
