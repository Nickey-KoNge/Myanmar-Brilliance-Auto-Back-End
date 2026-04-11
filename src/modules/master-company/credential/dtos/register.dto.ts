//src/modules/master-company/credential/dtos/register.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';
export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  email!: string;

  @IsNotEmpty()
  @IsString()
  password!: string;
}
