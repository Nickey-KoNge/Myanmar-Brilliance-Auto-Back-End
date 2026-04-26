import { PartialType } from '@nestjs/mapped-types';
import { CreateRentalOperationDto } from './create-rental-operation.dto';

export class UpdateRentalOperationDto extends PartialType(
  CreateRentalOperationDto,
) {}
