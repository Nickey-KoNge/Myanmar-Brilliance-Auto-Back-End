import { Expose, Transform, Type } from 'class-transformer';

class RouteTripPriceDetailDto {
  @Expose() id!: string;
  @Expose() vehicle_model_id!: string;
  @Expose() daily_trip_rate!: string;
  @Expose() overnight_trip_rate!: string;
  @Expose() status!: string;

  @Expose()
  @Transform(
    ({
      obj,
    }: {
      obj: { vehicle_model_relation?: { vehicle_model_name: string } };
    }) => obj.vehicle_model_relation?.vehicle_model_name || null,
  )
  vehicle_model_name!: string | null;
}

export class GetRouteSerialize {
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
  updated_at!: Date;

  @Expose()
  @Type(() => RouteTripPriceDetailDto)
  trip_prices!: RouteTripPriceDetailDto[];
}
