import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { MasterVehicleService } from './master-vehicle.vehicle.service';
import { CreateVehicleDto } from './dtos/create-vehicle.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { GetVehicleSerialize } from './serialize/get-vehicle.serialize';
import { UpdateVehicleDto } from './dtos/update-vehicle.dto';
import { PaginateVehicleDto } from './dtos/paginate-vehicle.dto';
import { FindVehicleSerialize } from './serialize/find-vehicle.serialize';
import { AtGuard } from 'src/common/guards/at.guard';

interface AuthenticatedRequest {
  user?: {
    sub?: string;
    id?: string;
    staffName?: string;
    email?: string;
  };
}
@Controller('master-vehicle/vehicles')
@UseGuards(AtGuard)
export class MasterVehicleController {
  constructor(private readonly service: MasterVehicleService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() dto: CreateVehicleDto,
    @Req() req: AuthenticatedRequest,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const userId =
      req.user?.staffName || req.user?.email || req.user?.sub || 'Unknown User';
    return await this.service.create(dto, userId, file);
  }

  @Get()
  @Serialize(FindVehicleSerialize)
  async findAll(@Query() query: PaginateVehicleDto) {
    return await this.service.findAll(query);
  }

  @Get(':id')
  @Serialize(GetVehicleSerialize)
  async findOne(@Param('id') id: string) {
    return await this.service.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'))
  @Serialize(GetVehicleSerialize)
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateVehicleDto,
    @Req() req: AuthenticatedRequest,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const userId =
      req.user?.staffName || req.user?.email || req.user?.sub || 'Unknown User';
    return await this.service.update(id, updateDto, userId, file);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const userId =
      req.user?.staffName || req.user?.email || req.user?.sub || 'Unknown User';
    return await this.service.remove(id, userId);
  }
  @Post('restore/:auditId')
  async restore(
    @Param('auditId') auditId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId =
      req.user?.staffName || req.user?.email || req.user?.sub || 'Unknown User';
    return await this.service.restoreVehicle(auditId, userId);
  }
}
