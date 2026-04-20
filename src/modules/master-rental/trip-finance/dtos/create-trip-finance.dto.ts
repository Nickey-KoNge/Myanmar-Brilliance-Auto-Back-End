import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  IsUUID,
  IsDateString,
} from 'class-validator';

export class CreateTripFinanceDto {
  @IsUUID()
  @IsNotEmpty()
  trip_id!: string;

  @IsUUID()
  @IsNotEmpty()
  staff_id!: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  rental_amount?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  overtime_amount?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  refund_amount?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  total?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  payment_status?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  status?: string;

  @IsOptional()
  @IsDateString() // receive_date အတွက် format စစ်ရန်
  receive_date?: string;
}
