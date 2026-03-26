import { Expose } from 'class-transformer';

export class GetBranchesSerialize {
  @Expose()
  id: string;

  @Expose()
  branches_name: string;

  @Expose()
  gps_location: string;

  @Expose()
  phone: string;

  @Expose()
  description: string;

  @Expose()
  division: string;

  @Expose()
  city: string;

  @Expose()
  address: string;

  @Expose()
  company_id: string;

  @Expose()
  status: string;
}
