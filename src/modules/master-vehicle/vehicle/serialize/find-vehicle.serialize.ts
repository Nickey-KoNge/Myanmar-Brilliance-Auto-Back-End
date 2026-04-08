// src/modules/master-vehicle/vehicle/serialize/find-vehicle.serialize.ts
import { Expose, Transform } from 'class-transformer';

export class FindVehicleSerialize {
  @Expose()
  id!: string;

  @Expose()
  vehicle_name!: string;

  @Expose()
  license_plate!: string;

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
}
