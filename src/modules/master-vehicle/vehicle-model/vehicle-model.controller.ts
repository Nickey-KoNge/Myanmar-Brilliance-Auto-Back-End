import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Delete,
  Param,
  ParseUUIDPipe,
  Patch,
  // UseGuards,
} from '@nestjs/common';
import { Serialize } from '../../../common/interceptors/serialize.interceptor';
import { VehicleModelService } from './vehicle-model.service';
import { CreateVehicleModelDto } from './dtos/create-vehicle-model.dto';
import { UpdateVehicleModelDto } from './dtos/update-vehicle-model.dto';
import { PaginateVehicleModelDto } from './dtos/paginate-vehicle-model.dto';
import { VehicleModelDto } from './serialize/find-vehicle-model.serialize';
import { GetVehicleModelSerialize } from './serialize/get-vehicle-model.serialize';
// import { AtGuard } from '../../../common/guards/at.guard';

@Controller('vehicle-model')
// @UseGuards(AtGuard)
export class VehicleModelController {
  constructor(private readonly vehicleModelService: VehicleModelService) {}

  @Get('list')
  @Serialize(VehicleModelDto) // List အတွက် Serializer
  async findAll(
    @Query('search') search?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('vehicle_brand_id') vehicle_brand_id?: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.vehicleModelService.findAll({
      search,
      startDate,
      endDate,
      vehicle_brand_id,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  }

  @Get(':id')
  @Serialize(GetVehicleModelSerialize) // Single data အတွက် Serializer
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.vehicleModelService.findOne(id);
  }

  @Post('register')
  @Serialize(GetVehicleModelSerialize)
  async create(@Body() dto: CreateVehicleModelDto) {
    return this.vehicleModelService.create(dto);
  }

  @Patch(':id')
  @Serialize(GetVehicleModelSerialize)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateVehicleModelDto,
  ) {
    return this.vehicleModelService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.vehicleModelService.remove(id);
  }
}
