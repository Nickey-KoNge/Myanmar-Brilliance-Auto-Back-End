import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateVehicleDriverAssignDto } from './dtos/create-vehicle-driver-assign.dto';
import { VehicleDriverAssignService } from './vehicle-driver-assign.service';
import { PaginateVehicleDriverAssignDto } from './dtos/paginate-vehicle-driver-assign.dto';
import { UpdateVehicleDriverDto } from './dtos/update-vehicle-driver-assign.dto';

@Controller('master-vehicle/vehicle-driver-assign')
export class VehicleDriverAssignController {
  constructor(
    private readonly vehicleDriverAssignService: VehicleDriverAssignService,
  ) {}

  @Post()
  create(@Body() createVehicleDriverAssignDto: CreateVehicleDriverAssignDto) {
    return this.vehicleDriverAssignService.create(createVehicleDriverAssignDto);
  }

  @Get()
  async findAll(@Query() query: PaginateVehicleDriverAssignDto) {
    return await this.vehicleDriverAssignService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vehicleDriverAssignService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() UpdateVehicleDriverDto: UpdateVehicleDriverDto,
  ) {
    return await this.vehicleDriverAssignService.update(
      id,
      UpdateVehicleDriverDto,
    );
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.vehicleDriverAssignService.remove(id);
  }

  @Patch(':id/complete')
  async completeAssignment(@Param('id') id: string) {
    return await this.vehicleDriverAssignService.completeAssignment(id);
  }
}
