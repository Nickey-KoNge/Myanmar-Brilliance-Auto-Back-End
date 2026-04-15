import { PartialType } from '@nestjs/mapped-types';
import { CreateDriverDto } from './create-driver.dto';
// import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
export class UpdateDriverDto extends PartialType(CreateDriverDto) {}
