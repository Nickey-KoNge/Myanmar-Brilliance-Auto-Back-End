import { Expose } from 'class-transformer';

export class GetStationsSerialize {
  @Expose()
  id: string;

  @Expose()
  status: string;
}
