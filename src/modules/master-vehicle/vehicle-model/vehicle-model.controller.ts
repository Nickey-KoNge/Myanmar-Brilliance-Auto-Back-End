import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Delete,
  Param,
  Patch,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Serialize } from '../../../common/interceptors/serialize.interceptor';
import { VehicleModelService } from './vehicle-model.service';
import { CreateVehicleModelDto } from './dtos/create-vehicle-model.dto';
import { UpdateVehicleModelDto } from './dtos/update-vehicle-model.dto';
import { PaginateVehicleModelDto } from './dtos/paginate-vehicle-model.dto';
import { VehicleModelDto } from './serialize/find-vehicle-model.serialize';
import { GetVehicleModelSerialize } from './serialize/get-vehicle-model.serialize';
import { AtGuard } from '../../../common/guards/at.guard';

interface AuthenticatedRequest {
  user?: {
    sub?: string;
    id?: string;
    staffName?: string;
    email?: string;
  };
}
@Controller('master-vehicle/vehicle-models')
@UseGuards(AtGuard)
export class VehicleModelController {
  constructor(private readonly vehicleModelService: VehicleModelService) {}

  @Get()
  @Serialize(VehicleModelDto)
  async findAll(@Query() query: PaginateVehicleModelDto) {
    return this.vehicleModelService.findAll(query);
  }

  @Get(':id')
  @Serialize(GetVehicleModelSerialize)
  async findOne(@Param('id') id: string) {
    return await this.vehicleModelService.findOne(id);
  }

  @Post()
  @Serialize(GetVehicleModelSerialize)
  async create(
    @Body() dto: CreateVehicleModelDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId =
      req.user?.staffName || req.user?.email || req.user?.sub || 'Unknown User';
    return this.vehicleModelService.create(dto, userId);
  }

  @Patch(':id')
  @Serialize(GetVehicleModelSerialize)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateVehicleModelDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId =
      req.user?.staffName || req.user?.email || req.user?.sub || 'Unknown User';
    return this.vehicleModelService.update(id, dto, userId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const userId =
      req.user?.staffName || req.user?.email || req.user?.sub || 'Unknown User';
    return this.vehicleModelService.remove(id, userId);
  }

  @Post('restore/:auditId')
  async restore(
    @Param('auditId') auditId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId =
      req.user?.staffName || req.user?.email || req.user?.sub || 'Unknown User';
    return await this.vehicleModelService.restoreVehicleModel(auditId, userId);
  }
}
