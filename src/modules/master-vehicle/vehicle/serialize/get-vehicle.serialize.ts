import { Expose, Transform } from 'class-transformer';

export class GetVehicleSerialize {
  @Expose()
  id!: string;

  @Expose()
  vehicle_name!: string;

  @Expose()
  city_taxi_no!: string;

  @Expose()
  serial_no!: string;

  @Expose()
  vin_no!: string;

  @Expose()
  engine_no!: string;

  @Expose()
  license_plate!: string;

  @Expose()
  color!: string;

  @Expose()
  license_type!: string;

  @Expose()
  current_odometer!: string;

  @Expose()
  vehicle_license_exp!: string;

  @Expose()
  service_intervals!: string;

  @Expose()
  purchase_date!: string;

  @Expose()
  image!: string;

  @Expose()
  status!: string;

  // --- Foreign Keys (IDs) အား Transform ဖြင့် တိတိကျကျ ဆွဲထုတ်ခြင်း ---
  @Expose()
  @Transform(
    ({ obj }: { obj: { station?: { id: string } } }) => obj.station?.id || null,
  )
  station_id!: string | null;

  @Expose()
  @Transform(
    ({ obj }: { obj: { group?: { id: string } } }) => obj.group?.id || null,
  )
  group_id!: string | null;

  @Expose()
  @Transform(
    ({ obj }: { obj: { vehicle_model?: { id: string } } }) =>
      obj.vehicle_model?.id || null,
  )
  vehicle_model_id!: string | null;

  @Expose()
  supplier_id!: string | null;

  // --- Names ---
  @Expose()
  @Transform(
    ({ obj }: { obj: { station?: { station_name: string } } }) =>
      obj.station?.station_name || null,
  )
  station_name!: string | null;

  @Expose()
  @Transform(
    ({ obj }: { obj: { group?: { group_name: string } } }) =>
      obj.group?.group_name || null,
  )
  group_name!: string | null;

  @Expose()
  @Transform(
    ({ obj }: { obj: { vehicle_model?: { vehicle_model_name: string } } }) =>
      obj.vehicle_model?.vehicle_model_name || null,
  )
  vehicle_model_name!: string | null;
}
