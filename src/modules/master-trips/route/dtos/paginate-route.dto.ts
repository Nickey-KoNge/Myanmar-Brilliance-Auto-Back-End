import { IsOptional, IsString, IsInt, Min, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginateRouteDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  lastId?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  lastCreatedAt?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  // သီးခြား Vehicle Model (ကားအမျိုးအစား) ဖြင့် ချိတ်ဆက်ထားသော Route များကို ရှာရန်
  @IsOptional()
  @IsString()
  vehicle_model_id?: string;

  // နေ့စဉ်ခရီးစဉ် (Daily Trip) ဈေးနှုန်း အနည်းဆုံး Filter
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  min_daily_rate?: number;

  // နေ့စဉ်ခရီးစဉ် (Daily Trip) ဈေးနှုန်း အများဆုံး Filter
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  max_daily_rate?: number;

  // ညအိပ်ခရီးစဉ် (Overnight Trip) ဈေးနှုန်း အနည်းဆုံး Filter
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  min_overnight_rate?: number;

  // ညအိပ်ခရီးစဉ် (Overnight Trip) ဈေးနှုန်း အများဆုံး Filter
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  max_overnight_rate?: number;
}
