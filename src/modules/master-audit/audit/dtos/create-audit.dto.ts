//src/modules/master-audit/audit/dtos/create-audit.dto.ts
import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateAuditDto {
  @IsNotEmpty()
  @IsString()
  entity_name!: string;

  @IsNotEmpty()
  @IsString()
  entity_id!: string;

  @IsNotEmpty()
  @IsString()
  action!: string;

  @IsOptional()
  @IsObject()
  old_values!: string;

  @IsOptional()
  @IsObject()
  new_values!: string;

  @IsOptional()
  @IsString()
  performed_by!: string;
}
