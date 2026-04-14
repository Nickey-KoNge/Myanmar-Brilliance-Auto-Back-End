// src/modules/master-vehicle/vehicle/serialize/find-vehicle.serialize.ts
import { Expose } from 'class-transformer';

export class FindVehicleSerialize {
  @Expose()
  id!: string;

  @Expose()
  vehicle_name!: string;

  @Expose()
  license_plate!: string;

  @Expose()
  vin_no!: string;

  @Expose()
  engine_no!: string;

  @Expose()
  city_taxi_no!: string;

  @Expose()
  serial_no!: string;

  @Expose()
  purchase_date!: string;

  @Expose()
  license_type!: string;

  @Expose()
  current_odometer!: string;

  @Expose()
  vehicle_license_exp!: string;

  @Expose()
  service_intervals!: string;

  @Expose()
  type!: string;

  @Expose()
  color!: string;

  @Expose()
  status!: string;

  @Expose()
  image!: string;

  @Expose()
  station_id!: string;

  @Expose()
  group_id!: string;

  @Expose()
  vehicle_model_id!: string;

  @Expose()
  vehicle_model_name!: string;

  @Expose()
  station_name!: string;

  @Expose()
  group_name!: string;

  @Expose()
  activeCount!: number;

  @Expose()
  inactiveCount!: number;

  @Expose()
  lastEditedBy!: string;
}
