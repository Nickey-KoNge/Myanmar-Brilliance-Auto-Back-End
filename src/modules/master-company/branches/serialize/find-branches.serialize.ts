import { Expose, Transform } from 'class-transformer';

export class FindBranchesSerialize {
  @Expose()
  id: string;

  @Expose()
  branches_name: string;

  @Expose()
  company_id: string;

  @Expose()
  company_name: string;

  @Expose()
  gps_location: string;

  @Expose()
  phone: string;

  @Expose()
  description: string;

  @Expose()
  status: string;

  @Expose()
  @Transform(
    ({
      obj,
    }: {
      obj: { address?: string; city?: string; division?: string };
    }) => {
      const addr = obj.address || '';
      const city = obj.city || '';
      const div = obj.division || '';

      const combined = `${addr} ${city} ${div}`.trim();
      return combined === '' ? null : combined;
    },
    // { toClassOnly: true },
  )
  fullAddress: string;
}
