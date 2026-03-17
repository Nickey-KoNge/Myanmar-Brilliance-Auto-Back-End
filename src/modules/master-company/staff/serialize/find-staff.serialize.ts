import { Expose, Transform } from 'class-transformer';

export class FindStaffSerialize {
  @Expose()
  id: string;

  @Expose()
  staffName: string;

  @Expose()
  phone: string;

  @Expose()
  nrc: string;

  @Expose()
  position: string;

  @Expose()
  email: string;

  @Expose()
  image: string;

  // --- Company ---
  @Expose()
  company_id: string;

  @Expose()
  company_name: string;

  // --- Branch ---
  @Expose()
  branches_id: string;

  @Expose()
  branches_name: string;
  // --- Role ---
  @Expose()
  role_id: string;

  @Expose()
  role_name: string;
  // --- Credential ---
  @Expose()
  credential_id: string;

  @Expose()
  credential_email: string;
  // --- Full Address ---
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
  fullAddress: string;
}
