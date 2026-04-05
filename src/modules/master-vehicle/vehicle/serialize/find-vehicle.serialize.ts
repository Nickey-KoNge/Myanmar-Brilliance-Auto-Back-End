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
  @Transform(
    ({ obj }: { obj: { vehicle_model?: { vehicle_model_name: string } } }) =>
      obj.vehicle_model?.vehicle_model_name || null,
  )
  vehicle_model_name!: string;

  @Expose()
  @Transform(
    ({ obj }: { obj: { station?: { station_name: string } } }) =>
      obj.station?.station_name || null,
  )
  station_name!: string;

  @Expose()
  @Transform(
    ({ obj }: { obj: { group?: { group_name: string } } }) =>
      obj.group?.group_name || null,
  )
  group_name!: string;
}
