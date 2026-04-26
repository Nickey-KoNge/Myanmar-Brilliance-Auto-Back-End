import { Expose, Type } from 'class-transformer';

class TripPriceItemDto {
  @Expose() id!: string;
  @Expose() route_id!: string;
  @Expose() daily_trip_rate!: string;
  @Expose() overnight_trip_rate!: string;
  @Expose() status!: string;
}

class VehicleModelItemDto {
  @Expose() id!: string;
  @Expose() vehicle_model_name!: string;

  @Expose() vehicle_brand_name!: string;
  @Expose() vehicle_brand_id!: string;

  @Expose() body_type!: string;
  @Expose() fuel_type!: string;
  @Expose() engine_capacity!: string;
  @Expose() transmission!: string;

  @Expose() year_of_release!: Date;
  @Expose() status!: string;

  @Expose()
  @Type(() => TripPriceItemDto)
  trip_prices!: TripPriceItemDto[];
}

class BrandItemDto {
  @Expose() id!: string;
  @Expose() name!: string;
}

class MetaDto {
  @Expose() totalItems!: number;
  @Expose() totalPages!: number;
  @Expose() activeItems!: number;
  @Expose() inactiveItems!: number;
  @Expose() lastEditedBy!: string;
}

export class VehicleModelDto {
  @Expose()
  @Type(() => VehicleModelItemDto)
  data!: VehicleModelItemDto[];

  @Expose()
  @Type(() => VehicleModelItemDto)
  items!: VehicleModelItemDto[];

  @Expose()
  @Type(() => BrandItemDto)
  brands!: BrandItemDto[];

  @Expose() total!: number;
  @Expose() totalPages!: number;
  @Expose() currentPage!: number;
  @Expose() activeCount!: number;
  @Expose() inactiveCount!: number;
  @Expose() lastEditedBy!: string;

  @Expose()
  @Type(() => MetaDto)
  meta!: MetaDto;
}
