// src/modules/master-rental/rental-operation/dtos/generate-ops.dto.ts
import { IsNotEmpty, IsUUID } from 'class-validator';

export class GenerateOpsByStationDto {
  @IsUUID()
  @IsNotEmpty()
  station_id!: string;

  @IsUUID()
  @IsNotEmpty()
  route_id!: string;
}
