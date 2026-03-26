import { Expose } from 'class-transformer';

export class FindStationsSerialize {
  @Expose()
  id: string;

  @Expose()
  status: string;
}
