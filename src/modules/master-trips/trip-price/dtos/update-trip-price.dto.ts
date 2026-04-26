import { PartialType } from '@nestjs/mapped-types';
import { CreateTripPriceDto } from './create-trip-price.dto';

export class UpdateTripPriceDto extends PartialType(CreateTripPriceDto) {}