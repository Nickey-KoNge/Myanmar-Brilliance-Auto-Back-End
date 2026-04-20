// src/modules/master-vehicle/driver-assign/serialize/find-vehicle-driver-assign.serialize.ts
import { Expose, Transform } from 'class-transformer';

export class FindVehicleDriverAssignSerialize {
  @Expose()
  id!: string;

  // --- Dates & Odometers ---
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
    ({
      obj,
    }: {
      obj: {
        vehicle?: { current_odometer?: string };
        current_odometer?: string;
      };
    }) => obj.vehicle?.current_odometer || obj.current_odometer || null,
  )
  current_odometer!: string | null;

  @Expose()
  @Transform(
    ({
      obj,
    }: {
      obj: {
        station?: { branch?: { branches_name?: string } };
        branch_name?: string;
      };
    }) => obj.station?.branch?.branches_name || obj.branch_name || null,
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
