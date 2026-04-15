import {
  Controller,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Get,
  Query,
  Delete,
  Param,
  Patch,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AtGuard } from '../../../common/guards/at.guard';
import { Serialize } from '../../../common/interceptors/serialize.interceptor';
import { DriverResponseDto } from './serialize/driver-response.dto';
import { CreateDriverDto } from './dtos/create-driver.dto';
import { DriverService } from './driver.service';
import { UpdateDriverDto } from './dtos/update-driver.dto';
import { PaginateDriverDto } from './dtos/paginate-driver.dto';
// import { FindDriverSerialize } from './serialize/find-driver.serialize';
import { GetDriverSerialize } from './serialize/get-driver.serialize';

interface AuthenticatedRequest {
  user?: {
    sub?: string;
    id?: string;
    staffName?: string;
    email?: string;
  };
}

@Controller('master-company/driver')
@UseGuards(AtGuard)
export class DriverController {
  constructor(private readonly driverService: DriverService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  @Serialize(DriverResponseDto)
  async create(
    @Body() dto: CreateDriverDto,
    @Req() req: AuthenticatedRequest,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const userId =
      req.user?.staffName || req.user?.email || req.user?.sub || 'Unknown User';
    return this.driverService.createDriver(dto, userId, file);
  }

  @Get()
  async findAll(@Query() query: PaginateDriverDto) {
    return this.driverService.findAll(query);
  }

  @Get(':id')
  @Serialize(GetDriverSerialize)
  async findOne(@Param('id') id: string) {
    return await this.driverService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'))
  @Serialize(GetDriverSerialize)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateDriverDto,
    @Req() req: AuthenticatedRequest,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const userId =
      req.user?.staffName || req.user?.email || req.user?.sub || 'Unknown User';
    return this.driverService.update(id, dto, userId, file);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const userId =
      req.user?.staffName || req.user?.email || req.user?.sub || 'Unknown User';
    return this.driverService.remove(id, userId);
  }

  @Post('restore/:auditId')
  async restore(
    @Param('auditId') auditId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId =
      req.user?.staffName || req.user?.email || req.user?.sub || 'Unknown User';
    return await this.driverService.restoreDriver(auditId, userId);
  }
}
