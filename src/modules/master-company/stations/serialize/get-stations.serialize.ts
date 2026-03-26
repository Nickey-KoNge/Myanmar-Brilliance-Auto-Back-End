import { Expose } from 'class-transformer';

export class GetStationsSerialize {
  @Expose()
  id: string;

  @Expose()
  city: string;

  @Expose()
  division: string;

  @Expose()
  address: string;

  @Expose()
  status: string;
}
