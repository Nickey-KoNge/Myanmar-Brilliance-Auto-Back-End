export class CreateStaffDto {
    email: string;
    password: string;
    staffName: string;
    phone?: string;
    position?: string;
    status?: string;
    credential: string;
    company: string
}
