import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsUUID,
  IsDateString,
  IsEmail,
  MinLength,
} from 'class-validator';

export class CreateDriverDto {
  // 🛑 Email နှင့် Password ကို ထပ်တိုးပါ
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password!: string;

  @IsString()
  @IsNotEmpty()
  driver_name!: string;

  @IsString()
  @IsNotEmpty()
  nrc!: string;

  @IsDateString()
  @IsOptional()
  dob?: string;

  @IsString()
  @IsOptional()
  gender?: string;

  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsString()
  @IsNotEmpty()
  country!: string;

  @IsString()
  @IsNotEmpty()
  city!: string;

  @IsDateString()
  @IsOptional()
  join_date?: string;

  @IsString()
  @IsNotEmpty()
  address!: string;

  @IsOptional()
  @IsUUID()
  @IsNotEmpty()
  station_id?: string;

  @IsString()
  @IsOptional()
  deposits?: string;

  @IsString()
  @IsNotEmpty()
  license_no!: string;

  @IsString()
  @IsNotEmpty()
  license_type!: string;

  @IsDateString()
  @IsOptional()
  license_expiry?: string;

  @IsString()
  driving_exp!: string;

  @IsString()
  @IsOptional()
  status?: string;
}
