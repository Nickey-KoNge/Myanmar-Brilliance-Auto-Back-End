import { Expose } from 'class-transformer';

export class FindDriverSerialize {
  @Expose()
  id!: string;

  @Expose()
  driver_name!: string;

  @Expose()
  nrc!: string;

  @Expose()
  email!: string;

  @Expose()
  phone!: string;

  @Expose()
  station_id!: string | null;

  @Expose()
  credential_id!: string | null;

  @Expose()
  dob!: string | null;

  @Expose()
  gender!: string;

  @Expose()
  deposits!: string | null;

  @Expose()
  join_date!: string | null;

  @Expose()
  license_no!: string;

  @Expose()
  license_type!: string;

  @Expose()
  license_expiry!: string | null;

  @Expose()
  driving_exp!: string;

  @Expose()
  image!: string | null;

  @Expose()
  status!: string;

  @Expose()
  station_name!: string | null;

  @Expose()
  credential_email!: string | null;

  @Expose()
  fullAddress!: string | null;
}
