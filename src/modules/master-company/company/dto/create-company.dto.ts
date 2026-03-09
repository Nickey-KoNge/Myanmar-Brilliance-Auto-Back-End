export class CreateCompanyDto {
  companyName: string;
  regNumber: string;
  phone: string;
  email: string;
  country: string;
  city: string;
  streetAddress: string;
  websiteUrl?: string;
  establishYear: string; // Will be converted to Date
  regExpDate: string; // Will be converted to Date
  status?: string;
}
