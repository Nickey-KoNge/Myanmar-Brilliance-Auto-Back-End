// import { Expose, Transform } from 'class-transformer';

// export class GetRentalOperationSerialize {
//   @Expose() id!: string;
//   @Expose() route_id!: string;
//   @Expose() vehicle_id!: string;
//   @Expose() driver_id!: string;
//   @Expose() station_id!: string;

//   @Expose() daily_count!: string | null;
//   @Expose() description!: string | null;
//   @Expose() start_time!: Date | null;
//   @Expose() end_time!: Date | null;
//   @Expose() start_odo!: string | null;
//   @Expose() end_odo!: string | null;
//   @Expose() start_battery!: string | null;
//   @Expose() end_battery!: string | null;
//   @Expose() extra_hours!: string | null;
//   @Expose() overnight_count!: string | null;
//   @Expose() trip_status!: string;
//   @Expose() distance!: string | null;
//   @Expose() power_station_name!: string | null;
//   @Expose() kw!: string | null;
//   @Expose() amount!: string | null;
//   @Expose() status!: string;
//   @Expose() created_at!: Date;
//   @Expose() updated_at!: Date;

//   // --- Relations (Names) ---
//   @Expose()
//   @Transform(
//     ({ obj }: { obj: { route?: { route_name: string } } }) =>
//       obj.route?.route_name || null,
//   )
//   route_name!: string | null;

//   @Expose()
//   @Transform(
//     ({ obj }: { obj: { vehicle?: { vehicle_name: string } } }) =>
//       obj.vehicle?.vehicle_name || null,
//   )
//   vehicle_name!: string | null;

//   @Expose()
//   @Transform(
//     ({ obj }: { obj: { driver?: { driver_name: string } } }) =>
//       obj.driver?.driver_name || null,
//   )
//   driver_name!: string | null;

//   @Expose()
//   @Transform(
//     ({ obj }: { obj: { station?: { station_name: string } } }) =>
//       obj.station?.station_name || null,
//   )
//   station_name!: string | null;

//   @Expose()
//   @Transform(
//     ({ obj }: { obj: { station?: { branch?: { branches_name: string } } } }) =>
//       obj.station?.branch?.branches_name || null,
//   )
//   branch_name!: string | null;

//   @Expose()
//   @Transform(
//     ({ obj }: { obj: { vehicle?: { image: string } } }) =>
//       obj.vehicle?.image || null,
//   )
//   vehicle_image!: string | null;

//   @Expose()
//   @Transform(
//     ({ obj }: { obj: { driver?: { image: string } } }) =>
//       obj.driver?.image || null,
//   )
//   driver_image!: string | null;
// }

import { Expose, Transform } from 'class-transformer';

export class GetRentalOperationSerialize {
  @Expose() id!: string;
  @Expose() route_id!: string;
  @Expose() vehicle_id!: string;
  @Expose() driver_id!: string;
  @Expose() station_id!: string;

  @Expose() daily_count!: string | null;
  @Expose() description!: string | null;
  @Expose() start_time!: Date | null;
  @Expose() end_time!: Date | null;
  @Expose() start_odo!: string | null;
  @Expose() end_odo!: string | null;
  @Expose() start_battery!: string | null;
  @Expose() end_battery!: string | null;
  @Expose() extra_hours!: string | null;
  @Expose() overnight_count!: string | null;
  @Expose() trip_status!: string;
  @Expose() distance!: string | null;
  @Expose() power_station_name!: string | null;
  @Expose() kw!: string | null;
  @Expose() amount!: string | null;
  @Expose() status!: string;
  @Expose() created_at!: Date;
  @Expose() updated_at!: Date;

  // --- Relations (Names) ---
  @Expose()
  @Transform(
    ({ obj }: { obj: { route?: { route_name?: string | null } } }) =>
      obj.route?.route_name || null,
  )
  route_name!: string | null;

  @Expose()
  @Transform(
    ({ obj }: { obj: { vehicle?: { vehicle_name?: string | null } } }) =>
      obj.vehicle?.vehicle_name || null,
  )
  vehicle_name!: string | null;

  @Expose()
  @Transform(
    ({ obj }: { obj: { vehicle?: { plate_number?: string | null } } }) =>
      obj.vehicle?.plate_number || null,
  )
  plate_number!: string | null;

  @Expose()
  @Transform(
    ({ obj }: { obj: { driver?: { driver_name?: string | null } } }) =>
      obj.driver?.driver_name || null,
  )
  driver_name!: string | null;

  @Expose()
  @Transform(
    ({ obj }: { obj: { station?: { station_name?: string | null } } }) =>
      obj.station?.station_name || null,
  )
  station_name!: string | null;

  @Expose()
  @Transform(
    ({
      obj,
    }: {
      obj: { station?: { branch?: { branches_name?: string | null } } };
    }) => obj.station?.branch?.branches_name || null,
  )
  branch_name!: string | null;

  @Expose()
  @Transform(
    ({ obj }: { obj: { vehicle?: { image?: string | null } } }) =>
      obj.vehicle?.image || null,
  )
  vehicle_image_url!: string | null;

  @Expose()
  @Transform(
    ({ obj }: { obj: { driver?: { image?: string | null } } }) =>
      obj.driver?.image || null,
  )
  driver_image_url!: string | null;
}
