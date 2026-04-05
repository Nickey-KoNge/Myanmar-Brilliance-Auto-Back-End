//src/modules/master-service/role/dtos/create-role.dto.ts
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
export class CreateRoleDto {
  @IsNotEmpty()
  @IsString()
  role_name!: string;

  @IsOptional()
  @IsString()
  status!: string;
}
