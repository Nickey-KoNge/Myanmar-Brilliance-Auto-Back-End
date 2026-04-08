// src/modules/master-vehicle/driver-assign/serialize/get-vehicle-driver-assign.serialize.ts
import { Expose, Transform } from 'class-transformer';

export class GetVehicleDriverAssignSerialize {
  @Expose()
  id!: string;

  // --- Foreign Keys (IDs) ---
  @Expose()
  driver_id!: string;

  @Expose()
  vehicle_id!: string;

  @Expose()
  station_id!: string;

  // --- Assignment Details ---
  @Expose()
  assigned_at!: string;

  @Expose()
  returned_at!: string;

  @Expose()
  status!: string;

  @Expose()
  @Transform(
    ({ obj }: { obj: { driver?: { driver_name: string } } }) =>
      obj.driver?.driver_name || null,
  )
  driver_name!: string;

  @Expose()
  @Transform(
    ({ obj }: { obj: { vehicle?: { vehicle_name: string } } }) =>
      obj.vehicle?.vehicle_name || null,
  )
  vehicle_name!: string;

  @Expose()
  @Transform(
    ({ obj }: { obj: { vehicle?: { license_plate: string } } }) =>
      obj.vehicle?.license_plate || null,
  )
  license_plate!: string;

  @Expose()
  @Transform(
    ({ obj }: { obj: { station?: { station_name: string } } }) =>
      obj.station?.station_name || null,
  )
  station_name!: string;
}
