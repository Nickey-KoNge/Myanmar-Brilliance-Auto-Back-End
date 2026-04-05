import { Expose, Transform } from 'class-transformer';

export class GetBranchesSerialize {
  @Expose()
  id!: string;

  @Expose()
  branches_name!: string;

  @Expose()
  gps_location!: string;

  @Expose()
  phone!: string;

  @Expose()
  description!: string;

  @Expose()
  division!: string;

  @Expose()
  city!: string;

  @Expose()
  address!: string;

  @Expose()
  @Transform(({ obj }: { obj: { company?: { id: string } } }) => {
    return obj.company?.id || null;
  })
  company_id!: string;

  @Expose()
  @Transform(({ obj }: { obj: { company?: { company_name: string } } }) => {
    return obj.company?.company_name || null;
  })
  company_name!: string;

  @Expose()
  status!: string;
}
