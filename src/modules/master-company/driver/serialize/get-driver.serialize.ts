import { Expose, Transform } from 'class-transformer';

interface DriverWithRelations {
  stations?: {
    id?: string;
    station_name?: string;
  };
  credential?: {
    id?: string;
    email?: string;
  };
}

export class GetDriverSerialize {
  @Expose()
  id!: string;

  @Expose()
  driver_name!: string;

  @Expose()
  nrc!: string;

  @Expose()
  phone!: string;

  @Expose()
  address!: string;

  @Expose()
  city!: string;

  @Expose()
  country!: string;

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

  // --- Transformed Foreign Keys ---

  @Expose()
  @Transform(
    ({ obj }: { obj: DriverWithRelations & { station_id?: string } }) => {
      return obj.stations?.id || obj.station_id || null;
    },
  )
  station_id!: string | null;

  @Expose()
  @Transform(({ obj }: { obj: DriverWithRelations }) => {
    return obj.stations?.station_name || null;
  })
  station_name!: string | null;

  @Expose()
  @Transform(
    ({ obj }: { obj: DriverWithRelations & { credential_id?: string } }) => {
      return obj.credential?.id || obj.credential_id || null;
    },
  )
  credential_id!: string | null;

  @Expose()
  @Transform(({ obj }: { obj: DriverWithRelations }) => {
    return obj.credential?.email || null;
  })
  email!: string | null;
}
