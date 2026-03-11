// src/modules/master-company/company/company.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dtos/create-company.dto';
import { UpdateCompanyDto } from './dtos/update-company.dto';

@Controller('master-company/company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}
  // @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  findAll() {
    return this.companyService.findAll();
  }
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Body() dto: CreateCompanyDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.companyService.create(dto, file);
  }
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.companyService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('file'))
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCompanyDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.companyService.update(id, dto, file);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.companyService.remove(id);
  }
}
