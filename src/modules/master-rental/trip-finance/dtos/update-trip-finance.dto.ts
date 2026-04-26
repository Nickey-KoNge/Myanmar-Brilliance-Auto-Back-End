import { PartialType } from '@nestjs/mapped-types';
import { CreateTripFinanceDto } from './create-trip-finance.dto';

export class UpdateTripFinanceDto extends PartialType(CreateTripFinanceDto) {}
