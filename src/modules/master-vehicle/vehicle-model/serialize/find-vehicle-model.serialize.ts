import { Expose, Transform } from 'class-transformer';

export class FindVehicleModelSerialize {
  @Expose()
  id!: string;

  @Expose()
  vehicle_model_name!: string;

  @Expose()
  vehicle_brand_id!: string;

  // --- Vehicle Brand ---

  @Expose()
  @Transform(
    ({ obj }: { obj: { vehicle_brand?: { vehicle_brand_name: string } } }) =>
      obj.vehicle_brand?.vehicle_brand_name || null,
  )
  vehicle_brand_name!: string;

  @Expose()
  body_type!: string;

  @Expose()
  fuel_type!: string;

  @Expose()
  transmission!: string;

  @Expose()
  engine_capacity!: string;

  @Expose()
  year_of_release!: string;

  @Expose()
  status!: string;
}
