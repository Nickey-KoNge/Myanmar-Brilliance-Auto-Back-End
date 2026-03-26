import { Expose } from 'class-transformer';

export class FindVehicleBrandsSerialize {
  @Expose()
  id: string;

  @Expose()
  status: string;
}
