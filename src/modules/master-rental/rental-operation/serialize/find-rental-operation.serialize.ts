// import { Expose, Transform, Type } from 'class-transformer';

// class RentalOperationItemDto {
//   @Expose() id!: string;
//   @Expose() route_id!: string;
//   @Expose() vehicle_id!: string;
//   @Expose() driver_id!: string;
//   @Expose() station_id!: string;

//   @Expose() daily_count!: string | null;
//   @Expose() trip_status!: string;
//   @Expose() start_time!: Date | null;
//   @Expose() end_time!: Date | null;

//   @Expose() start_odo!: string | null;
//   @Expose() end_odo!: string | null;
//   @Expose() start_battery!: string | null;
//   @Expose() end_battery!: string | null;
//   @Expose() extra_hours!: string | null;
//   @Expose() kw!: string | null;
//   @Expose() amount!: string | null;

//   @Expose() status!: string;
//   @Expose() created_at!: Date;
//   @Expose() updated_at!: Date;
//   @Expose() description!: string | null;
//   @Expose() overnight_count!: string | null;
//   @Expose() distance!: string | null;
//   @Expose() power_station_name!: string | null;


//   // trip finance relation
// @Expose()
// @Transform(({ obj }) => obj.trip_finances?.[0]?.rental_amount || null)
// rental_amount!: string | null;

// @Expose()
// @Transform(({ obj }) => obj.trip_finances?.[0]?.overtime_amount || null)
// overtime_amount!: string | null;

// @Expose()
// @Transform(({ obj }) => obj.trip_finances?.[0]?.refund_amount || null)
// refund_amount!: string | null;

// @Expose()
// @Transform(({ obj }) => obj.trip_finances?.[0]?.total || null)
// total!: string | null;

// @Expose()
// @Transform(({ obj }) => obj.trip_finances?.[0]?.payment_status || null)
// payment_status!: string | null;


//   // --- Relations (Names) ---
  


//   @Expose()
//   @Transform(
//     ({ obj }: { obj: { route?: { route_name?: string | null } } }) =>
//       obj.route?.route_name || null,
//   )
//   route_name!: string | null;

//   @Expose()
//   @Transform(
//     ({ obj }: { obj: { vehicle?: { vehicle_name?: string | null } } }) =>
//       obj.vehicle?.vehicle_name || null,
//   )
//   vehicle_name!: string | null;

//   @Expose()
//   @Transform(
//     ({ obj }: { obj: { vehicle?: { plate_number?: string | null } } }) =>
//       obj.vehicle?.plate_number || null,
//   )
//   plate_number!: string | null;

//   @Expose()
//   @Transform(
//     ({ obj }: { obj: { vehicle?: { image?: string | null } } }) =>
//       obj.vehicle?.image || null,
//   )
//   vehicle_image_url!: string | null;

//   @Expose()
//   @Transform(
//     ({ obj }: { obj: { driver?: { driver_name?: string | null } } }) =>
//       obj.driver?.driver_name || null,
//   )
//   driver_name!: string | null;

//   @Expose()
//   @Transform(
//     ({ obj }: { obj: { driver?: { image?: string | null } } }) =>
//       obj.driver?.image || null,
//   )
//   driver_image_url!: string | null;

//   @Expose()
//   @Transform(
//     ({ obj }: { obj: { station?: { station_name?: string | null } } }) =>
//       obj.station?.station_name || null,
//   )
//   station_name!: string | null;

//   @Expose()
//   @Transform(
//     ({
//       obj,
//     }: {
//       obj: { station?: { branch?: { branches_name?: string | null } } };
//     }) => obj.station?.branch?.branches_name || null,
//   )
//   branch_name!: string | null;
// }

// class MetaDto {
//   @Expose() totalItems!: number;
//   @Expose() itemCount!: number;
//   @Expose() itemsPerPage!: number;
//   @Expose() totalPages!: number;
//   @Expose() currentPage!: number;
// }

// export class FindRentalOperationSerialize {
//   @Expose()
//   @Type(() => RentalOperationItemDto)
//   items!: RentalOperationItemDto[];

//   @Expose()
//   @Type(() => MetaDto)
//   meta!: MetaDto;
// }


import { Expose, Transform, Type } from 'class-transformer';

class TripFinanceDto {
  @Expose() rental_amount!: string | null;
  @Expose() overtime_amount!: string | null;
  @Expose() refund_amount!: string | null;
  @Expose() total!: string | null;
  @Expose() payment_status!: string | null;
}

class RentalOperationItemDto {
  @Expose() id!: string;
  @Expose() route_id!: string;
  @Expose() vehicle_id!: string;
  @Expose() driver_id!: string;
  @Expose() station_id!: string;

  @Expose() daily_count!: string | null;
  @Expose() trip_status!: string;

  @Expose()
  @Type(() => Date)
  start_time!: Date | null;

  @Expose()
  @Type(() => Date)
  end_time!: Date | null;

  @Expose() start_odo!: string | null;
  @Expose() end_odo!: string | null;
  @Expose() start_battery!: string | null;
  @Expose() end_battery!: string | null;
  @Expose() extra_hours!: string | null;
  @Expose() kw!: string | null;
  @Expose() amount!: string | null;

  @Expose() status!: string;

  @Expose()
  @Type(() => Date)
  created_at!: Date;

  @Expose()
  @Type(() => Date)
  updated_at!: Date;

  @Expose() description!: string | null;
  @Expose() overnight_count!: string | null;
  @Expose() distance!: string | null;
  @Expose() power_station_name!: string | null;

  // -------------------------
  // FINANCE (OneToMany)
  // -------------------------
  @Expose()
  @Type(() => TripFinanceDto)
  trip_finances!: TripFinanceDto[];

  // -------------------------
  // RELATIONS (FLATTENED)
  // -------------------------
  @Expose()
  @Transform(({ obj }) => obj.route?.route_name || null)
  route_name!: string | null;

  @Expose()
  @Transform(({ obj }) => obj.vehicle?.vehicle_name || null)
  vehicle_name!: string | null;

  @Expose()
  @Transform(({ obj }) => obj.vehicle?.plate_number || null)
  plate_number!: string | null;

  @Expose()
  @Transform(({ obj }) => obj.vehicle?.image || null)
  vehicle_image_url!: string | null;

  @Expose()
  @Transform(({ obj }) => obj.driver?.driver_name || null)
  driver_name!: string | null;

  @Expose()
  @Transform(({ obj }) => obj.driver?.image || null)
  driver_image_url!: string | null;

  @Expose()
  @Transform(({ obj }) => obj.station?.station_name || null)
  station_name!: string | null;

  @Expose()
  @Transform(({ obj }) =>
    obj.station?.branch?.branches_name || null
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