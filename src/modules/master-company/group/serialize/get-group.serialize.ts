import { Expose, Transform } from 'class-transformer';
interface GroupEntityPayload {
  stations?: {
    station_name?: string;
  } | null;
  [key: string]: unknown;
}
export class GetGroupSerialize {
  @Expose()
  id!: string;

  @Expose()
  group_name!: string;

  @Expose()
  group_type!: string;

  @Expose()
  station_id!: string;

  @Expose()
  @Transform(
    ({ obj }: { obj: GroupEntityPayload }) =>
      obj.stations?.station_name || null,
  )
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
