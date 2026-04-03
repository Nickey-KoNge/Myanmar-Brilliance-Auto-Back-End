import { IsNotEmpty, IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateGroupDto {
  @IsString()
  @IsNotEmpty()
  group_name: string;

  @IsString()
  @IsNotEmpty()
  group_type: string;

  @IsUUID()
  @IsNotEmpty()
  station_id: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  status?: string;
}