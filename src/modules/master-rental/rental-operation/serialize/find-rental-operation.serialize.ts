import { Expose, Transform, Type } from 'class-transformer';

class RentalOperationItemDto {
  @Expose() id!: string;
  @Expose() route_id!: string;
  @Expose() vehicle_id!: string;
  @Expose() driver_id!: string;
  @Expose() station_id!: string;

  @Expose() daily_count!: string | null;
  @Expose() trip_status!: string;
  @Expose() start_time!: Date | null;
  @Expose() end_time!: Date | null;

  @Expose() start_odo!: string | null;
  @Expose() end_odo!: string | null;
  @Expose() start_battery!: string | null;
  @Expose() end_battery!: string | null;
  @Expose() extra_hours!: string | null;
  @Expose() kw!: string | null;
  @Expose() amount!: string | null;

  @Expose() status!: string;
  @Expose() created_at!: Date;

  // --- Relations (Names) ---
  @Expose()
  @Transform(
    ({ obj }: { obj: { route?: { route_name: string } } }) =>
      obj.route?.route_name || null,
  )
  route_name!: string | null;

  @Expose()
  @Transform(
    ({ obj }: { obj: { vehicle?: { vehicle_name: string } } }) =>
      obj.vehicle?.vehicle_name || null,
  )
  vehicle_name!: string | null;

  @Expose()
  @Transform(
    ({ obj }: { obj: { driver?: { driver_name: string } } }) =>
      obj.driver?.driver_name || null,
  )
  driver_name!: string | null;

  @Expose()
  @Transform(
    ({ obj }: { obj: { station?: { station_name: string } } }) =>
      obj.station?.station_name || null,
  )
  station_name!: string | null;

  @Expose()
  @Transform(
    ({ obj }: { obj: { station?: { branch?: { branches_name: string } } } }) =>
      obj.station?.branch?.branches_name || null,
  )
  branch_name!: string | null;
}

class MetaDto {
  @Expose() totalItems!: number;
  @Expose() itemCount!: number;
  @Expose() itemsPerPage!: number;
  @Expose() totalPages!: number;
  @Expose() currentPage!: number;
}

export class FindRentalOperationSerialize {
  @Expose()
  @Type(() => RentalOperationItemDto)
  items!: RentalOperationItemDto[];

  @Expose()
  @Type(() => MetaDto)
  meta!: MetaDto;
}
