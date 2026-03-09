export class CreateCompanyDto {
  companyName: string;
  regNumber: string;
  streetAddress: string;
  city: string;
  country: string;
  phone: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  websiteUrl?: string;
  establishYear?: Date;
  regExpDate?: Date;
  image?: string;
  email: string;
  status?: string;
}