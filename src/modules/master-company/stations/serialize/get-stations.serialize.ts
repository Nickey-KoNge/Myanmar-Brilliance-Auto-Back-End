import { Expose } from 'class-transformer';

export class GetStationsSerialize {
  @Expose()
  id: string;

  @Expose()
  station_name: string;

  @Expose()
  gps_location: string;

  @Expose()
  description: string;

  @Expose()
  phone: string;

  @Expose()
  city: string;

  @Expose()
  division: string;

  @Expose()
  address: string;

  @Expose()
  status: string;

  @Expose()
  branch_id: string;

  @Expose()
  branch_name: string;
}
