import { Expose } from 'class-transformer';

export class GetCompanySerialize {
  @Expose()
  id: string;

  @Expose()
  company_name: string;

  @Expose()
  reg_number: string;

  @Expose()
  phone: string;

  @Expose()
  email: string;

  @Expose()
  owner_name: string;

  @Expose()
  owner_phone: string;

  @Expose()
  owner_email: string;

  @Expose()
  image: string;

  @Expose()
  city: string;

  @Expose()
  country: string;

  @Expose()
  street_address: string;

  @Expose()
  status: string;

  @Expose()
  website_url: string;

  @Expose()
  establish_year: string;

  @Expose()
  reg_exp_date: string;
}
