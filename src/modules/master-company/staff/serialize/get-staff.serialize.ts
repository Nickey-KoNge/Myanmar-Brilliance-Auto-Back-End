import { Expose, Transform } from 'class-transformer';

export class GetStaffSerialize {
  @Expose()
  id: string;

  @Expose()
  staffName: string;

  @Expose()
  phone: string;

  @Expose()
  position: string;

  // --- Credential ---
  @Expose()
  @Transform(({ obj }: { obj: any }) => {
    const staff = obj as { credential?: { email: string; id: string } };
    return staff.credential?.email || null;
  })
  email: string;

  @Expose()
  @Transform(({ obj }: { obj: any }) => {
    const staff = obj as { credential?: { id: string } };
    return staff.credential?.id || null;
  })
  credential_id: string;

  @Expose()
  street_address: string;

  @Expose()
  city: string;

  @Expose()
  country: string;

  @Expose()
  dob: string;

  @Expose()
  nrc: string;

  @Expose()
  gender: string;

  @Expose()
  image: string;
}
