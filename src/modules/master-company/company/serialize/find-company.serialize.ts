import { Expose, Transform } from 'class-transformer';

export class FindCompanySerialize {
  @Expose()
  id!: string;

  @Expose()
  company_name!: string;

  @Expose()
  reg_number!: string;

  @Expose()
  phone!: string;

  @Expose()
  email!: string;

  @Expose()
  owner_name!: string;

  @Expose()
  owner_phone!: string;

  @Expose()
  owner_email!: string;

  @Expose()
  image!: string;

  @Expose()
  status!: string;

  @Expose()
  @Transform(
    ({
      obj,
    }: {
      obj: { street_address?: string; city?: string; country?: string };
    }) => {
      const addr = obj.street_address || '';
      const city = obj.city || '';
      const country = obj.country || '';

      const combined = `${addr} ${city} ${country}`.trim();
      return combined === '' ? null : combined;
    },
    { toClassOnly: true },
  )
  fullAddress!: string;

  @Expose()
  website_url!: string;

  @Expose()
  establish_year!: string;

  @Expose()
  reg_exp_date!: string;

  @Expose()
  activeCount!: number;

  @Expose()
  inactiveCount!: number;

  @Expose()
  lastEditedBy!: string;
}
