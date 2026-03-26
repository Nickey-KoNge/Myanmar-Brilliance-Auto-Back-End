import { Expose } from 'class-transformer';

export class GetVehicleBrandsSerialize {
  @Expose()
  id: string;

  @Expose()
  status: string;
}
