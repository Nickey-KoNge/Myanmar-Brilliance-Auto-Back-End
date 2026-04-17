import { Expose, Transform, Type } from 'class-transformer';

class StationTripPriceDetailDto {
  @Expose() id!: string;
  @Expose() route_id!: string;
  @Expose() vehicle_model_id!: string;
  @Expose() daily_trip_rate!: string;
  @Expose() overnight_trip_rate!: string;
  @Expose() status!: string;
}

export class GetStationsSerialize {
  @Expose()
  id!: string;

  @Expose()
  station_name!: string;

  @Expose()
  gps_location!: string;

  @Expose()
  description!: string;

  @Expose()
  phone!: string;

  @Expose()
  city!: string;

  @Expose()
  division!: string;

  @Expose()
  address!: string;

  @Expose()
  status!: string;

  @Expose()
  @Transform(({ obj }: { obj: { branch?: { id: string } } }) => {
    return obj.branch?.id || null;
  })
  branches_id!: string;

  @Expose()
  @Transform(({ obj }: { obj: { branch?: { branches_name: string } } }) => {
    return obj.branch?.branches_name || null;
  })
  branches_name!: string;

  @Expose()
  @Type(() => StationTripPriceDetailDto)
  trip_prices!: StationTripPriceDetailDto[];
}
