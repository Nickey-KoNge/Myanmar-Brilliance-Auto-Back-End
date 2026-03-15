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
  UseGuards,
} from '@nestjs/common';
import { StaffService } from './staff.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { AtGuard } from '../../../common/guards/at.guard';

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
  findAll() {
    return this.staffService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.staffService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'))
  update(
    @Param('id') id: string,
    @Body() updateStaffDto: UpdateStaffDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.staffService.update(id, updateStaffDto, file);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.staffService.remove(id);
  }
}
