import { Expose } from 'class-transformer';

export class GetDriverSerialize {
  @Expose()
  id: string;

  @Expose()
  city: string;

  @Expose()
  country: string;

  @Expose()
  address: string;

  @Expose()
  status: string;
}
