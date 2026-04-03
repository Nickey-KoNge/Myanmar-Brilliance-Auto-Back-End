import { Expose } from 'class-transformer';

export class FindVehicleBrandsSerialize {
  @Expose()
  id: string;

  @Expose()
  image: string;

  @Expose()
  vehicle_brand_name: string;

  @Expose()
  country_of_origin: string;

  @Expose()
  manufacturer: string;

  @Expose()
  description: string;

  @Expose()
  status: string;
}
