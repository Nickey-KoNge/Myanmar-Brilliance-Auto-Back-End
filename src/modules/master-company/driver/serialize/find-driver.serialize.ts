import { Expose, Transform } from 'class-transformer';

export class FindDriverSerialize {
  @Expose()
  id: string;

  @Expose()
  status: string;

  @Expose()
  @Transform(
    ({
      obj,
    }: {
      obj: { address?: string; city?: string; country?: string };
    }) => {
      const addr = obj.address || '';
      const city = obj.city || '';
      const country = obj.country || '';

      const combined = `${addr} ${city} ${country}`.trim();
      return combined === '' ? null : combined;
    },
    { toClassOnly: true },
  )
  fullAddress: string;
}
