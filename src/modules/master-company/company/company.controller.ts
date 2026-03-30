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
  UseGuards,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dtos/create-company.dto';
import { UpdateCompanyDto } from './dtos/update-company.dto';
import { AtGuard } from '../../../common/guards/at.guard';

//extra import for serialize
import { FindCompanySerialize } from './serialize/find-company.serialize';
import { PaginateCompanyDto } from './dtos/paginate-company.dto';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { GetCompanySerialize } from './serialize/get-company.serialize';

@Controller('master-company/company')
//@UseGuards(AtGuard)
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}
  // @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  @Serialize(FindCompanySerialize)
  findAll(@Query() query: PaginateCompanyDto) {
    return this.companyService.findAll(query);
  }
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  create(
    @Body() dto: CreateCompanyDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.companyService.create(dto, file);
  }
  @Get(':id')
  @Serialize(GetCompanySerialize)
  findOne(@Param('id') id: string) {
    return this.companyService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'))
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
