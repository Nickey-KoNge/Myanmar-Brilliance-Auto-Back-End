import { Expose } from 'class-transformer';

export class FindGroupSerialize {
  @Expose()
  id!: string;

  @Expose()
  group_name!: string;

  @Expose()
  group_type!: string;

  @Expose()
  station_id!: string;

  @Expose()
  station_name!: string;

  @Expose()
  description!: string;

  @Expose()
  status!: string;

  @Expose()
  activeCount!: number;

  @Expose()
  inactiveCount!: number;

  @Expose()
  lastEditedBy!: string;
}
