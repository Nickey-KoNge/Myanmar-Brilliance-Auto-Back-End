import { Expose, Transform } from 'class-transformer';

export class FindStationsSerialize {
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
  status!: string;

  @Expose()
  branches_id!: string;

  @Expose()
  branches_name!: string;

  @Expose()
  @Transform(
    ({
      obj,
    }: {
      obj: { address?: string; city?: string; division?: string };
    }) => {
      const addr = obj.address || '';
      const city = obj.city || '';
      const division = obj.division || '';

      const combined = `${addr} ${city} ${division}`.trim();
      return combined === '' ? null : combined;
    },
    { toClassOnly: true },
  )
  fullAddress!: string;

  @Expose()
  activeCount!: number;

  @Expose()
  inactiveCount!: number;

  @Expose()
  lastEditedBy!: string;
}
