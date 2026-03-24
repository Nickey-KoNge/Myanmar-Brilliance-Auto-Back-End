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
  // --- Role ---
  @Expose()
  @Transform(({ obj }: { obj: { role?: { id: string } } }) => {
    return obj.role?.id || null;
  })
  role_id: string;

  @Expose()
  @Transform(({ obj }: { obj: { role?: { role_name: string } } }) => {
    return obj.role?.role_name || null;
  })
  role_name: string;

  // --- Company ---
  @Expose()
  @Transform(({ obj }: { obj: { company?: { id: string } } }) => {
    return obj.company?.id || null;
  })
  company_id: string;

  @Expose()
  @Transform(({ obj }: { obj: { company?: { company_name: string } } }) => {
    return obj.company?.company_name || null;
  })
  company_name: string;

  // --- Branch ---
  @Expose()
  @Transform(({ obj }: { obj: { branch?: { id: string } } }) => {
    return obj.branch?.id || null;
  })
  branch_id: string;

  @Expose()
  @Transform(({ obj }: { obj: { branch?: { branches_name: string } } }) => {
    return obj.branch?.branches_name || null;
  })
  branch_name: string;

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
