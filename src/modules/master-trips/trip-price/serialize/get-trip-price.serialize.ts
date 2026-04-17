import { Expose, Transform } from 'class-transformer';

export class GetTripPriceSerialize {
  @Expose()
  id!: string;

  @Expose()
  route_id!: string;

  @Expose()
  vehicle_model_id!: string;

  @Expose()
  daily_trip_rate!: string;

  @Expose()
  overnight_trip_rate!: string;

  @Expose()
  status!: string;

  @Expose()
  created_at!: Date;

  @Expose()
  updated_at!: Date;

  @Expose()
  @Transform(
    ({ obj }: { obj: { route?: { route_name: string } } }) =>
      obj.route?.route_name || null,
  )
  route_name!: string | null;

  @Expose()
  @Transform(
    ({
      obj,
    }: {
      obj: { vehicle_model_relation?: { vehicle_model_name: string } };
    }) => obj.vehicle_model_relation?.vehicle_model_name || null,
  )
  vehicle_model_name!: string | null;

  @Expose()
  @Transform(
    ({ obj }: { obj: { station_relation?: { station_name: string } } }) =>
      obj.station_relation?.station_name || null,
  )
  station_name!: string | null;
}
