import { Expose, Type } from 'class-transformer';

class RouteTripPriceItemDto {
  @Expose()
  id!: string;

  @Expose()
  vehicle_model_id!: string;

  @Expose()
  daily_trip_rate!: string;

  @Expose()
  overnight_trip_rate!: string;

  @Expose()
  status!: string;
}
export class FindRouteSerialize {
  @Expose()
  id!: string;

  @Expose()
  route_name!: string;

  @Expose()
  start_location!: string;

  @Expose()
  end_location!: string;

  @Expose()
  status!: string;

  @Expose()
  created_at!: Date;

  @Expose()
  @Type(() => RouteTripPriceItemDto)
  trip_prices!: RouteTripPriceItemDto[];
}
