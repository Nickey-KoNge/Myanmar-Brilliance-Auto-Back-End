import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CreateVehicleDriverAssignDto } from './dtos/create-vehicle-driver-assign.dto';
import { VehicleDriverAssignService } from './vehicle-driver-assign.service';
import { PaginateVehicleDriverAssignDto } from './dtos/paginate-vehicle-driver-assign.dto';

@Controller('master-vehicle/vehicle-driver-assign')
export class VehicleDriverAssignController {
  constructor(
    private readonly driverAssignService: VehicleDriverAssignService,
  ) {}

  @Post()
  create(@Body() createVehicleDriverAssignDto: CreateVehicleDriverAssignDto) {
    return this.driverAssignService.create(createVehicleDriverAssignDto);
  }

  @Get()
  async findAll(@Query() query: PaginateVehicleDriverAssignDto) {
    return await this.driverAssignService.findAll(query);
  }
}
