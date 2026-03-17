import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
  Query,
  UseGuards,
} from '@nestjs/common';
import { StaffService } from './staff.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { AtGuard } from '../../../common/guards/at.guard';

//extra import for serialize
import { FindStaffSerialize } from './serialize/find-staff.serialize';
import { PaginateStaffDto } from './dto/paginate-staff.dto';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { GetStaffSerialize } from './serialize/get-staff.serialize';

@Controller('master-company/staff')
@UseGuards(AtGuard)
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  create(
    @Body() createStaffDto: CreateStaffDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.staffService.create(createStaffDto, file);
  }

  @Get()
  @Serialize(FindStaffSerialize)
  async findAll(@Query() query: PaginateStaffDto) {
    return await this.staffService.findAll(query);
  }

  @Get(':id')
  @Serialize(GetStaffSerialize)
  findOne(@Param('id') id: string) {
    return this.staffService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'))
  @Serialize(GetStaffSerialize)
  async update(
    @Param('id') id: string,
    @Body() updateStaffDto: UpdateStaffDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.staffService.update(id, updateStaffDto, file);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.staffService.remove(id);
  }
}
