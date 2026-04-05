//src/modules/master-company/credential/dtos/create-credential.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCredentialDto {
  @IsNotEmpty()
  @IsString()
  email!: string;

  @IsNotEmpty()
  @IsString()
  password!: string;

  @IsNotEmpty()
  @IsString()
  status!: string;
}
