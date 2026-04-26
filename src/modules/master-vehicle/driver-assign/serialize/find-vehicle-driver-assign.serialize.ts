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
  // --- ထပ်တိုးထားသော ကားနှင့် ယာဉ်မောင်း အချက်အလက်များ ---

  @Expose()
  @Transform(
    ({ obj }: { obj: { driver_nrc?: string; driver?: { nrc?: string } } }) =>
      obj.driver_nrc || obj.driver?.nrc || null,
  )
  driver_nrc!: string | null;

  @Expose()
  @Transform(
    ({ obj }: { obj: { phone?: string; driver?: { phone?: string } } }) =>
      obj.phone || obj.driver?.phone || null,
  )
  phone!: string | null;

  @Expose()
  @Transform(
    ({
      obj,
    }: {
      obj: { driver_license?: string; driver?: { license_no?: string } };
    }) => obj.driver_license || obj.driver?.license_no || null,
  )
  driver_license!: string | null;

  @Expose()
  @Transform(
    ({
      obj,
    }: {
      obj: { driver_license_type?: string; driver?: { license_type?: string } };
    }) => obj.driver_license_type || obj.driver?.license_type || null,
  )
  driver_license_type!: string | null;

  @Expose()
  @Transform(
    ({
      obj,
    }: {
      obj: { city_taxi_no?: string; vehicle?: { city_taxi_no?: string } };
    }) => obj.city_taxi_no || obj.vehicle?.city_taxi_no || null,
  )
  taxi_number!: string | null;

  @Expose()
  @Transform(
    ({ obj }: { obj: { color?: string; vehicle?: { color?: string } } }) =>
      obj.color || obj.vehicle?.color || null,
  )
  color!: string | null;
}
