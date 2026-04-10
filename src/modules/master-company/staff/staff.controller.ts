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
  Req,
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

interface AuthenticatedRequest {
  user?: {
    sub?: string;
    id?: string;
    staffName?: string;
    email?: string;
  };
}
@Controller('master-company/staff')
@UseGuards(AtGuard)
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  create(
    @Body() createStaffDto: CreateStaffDto,
    @Req() req: AuthenticatedRequest,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const userId =
      req.user?.staffName || req.user?.email || req.user?.sub || 'Unknown User';
    return this.staffService.create(createStaffDto, userId, file);
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
    @Req() req: AuthenticatedRequest,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const userId =
      req.user?.staffName || req.user?.email || req.user?.sub || 'Unknown User';
    return await this.staffService.update(id, updateStaffDto, userId, file);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const userId =
      req.user?.staffName || req.user?.email || req.user?.sub || 'Unknown User';
    return await this.staffService.remove(id, userId);
  }
  @Post('restore/:auditId')
  async restore(
    @Param('auditId') auditId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId =
      req.user?.staffName || req.user?.email || req.user?.sub || 'Unknown User';
    return await this.staffService.restoreStaff(auditId, userId);
  }
}
