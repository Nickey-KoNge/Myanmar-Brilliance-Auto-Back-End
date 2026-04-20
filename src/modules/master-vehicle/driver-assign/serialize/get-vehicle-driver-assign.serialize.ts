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

  @Expose()
  @Transform(
    ({ obj }: { obj: { vehicle?: { current_odometer?: string } } }) =>
      obj.vehicle?.current_odometer || null,
  )
  current_odometer!: string | null;

  @Expose()
  @Transform(
    ({ obj }: { obj: { station?: { branch?: { branches_name?: string } } } }) =>
      obj.station?.branch?.branches_name || null,
  )
  branch_name!: string | null;
  
  @Expose()
  @Transform(
    ({ obj }: { obj: { vehicle?: { image: string } } }) =>
      obj.vehicle?.image || null,
  )
  vehicle_image!: string | null;

  @Expose()
  @Transform(
    ({ obj }: { obj: { driver?: { image: string } } }) =>
      obj.driver?.image || null,
  )
  driver_image!: string | null;
}
