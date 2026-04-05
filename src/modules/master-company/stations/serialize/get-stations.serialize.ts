import { Expose, Transform } from 'class-transformer';

export class GetStationsSerialize {
  @Expose()
  id!: string;

  @Expose()
  station_name!: string;

  @Expose()
  gps_location!: string;

  @Expose()
  description!: string;

  @Expose()
  phone!: string;

  @Expose()
  city!: string;

  @Expose()
  division!: string;

  @Expose()
  address!: string;

  @Expose()
  status!: string;

  @Expose()
  @Transform(({ obj }: { obj: { branch?: { id: string } } }) => {
    return obj.branch?.id || null;
  })
  branches_id!: string;

  @Expose()
  @Transform(({ obj }: { obj: { branch?: { branches_name: string } } }) => {
    return obj.branch?.branches_name || null;
  })
  branches_name!: string;
}
