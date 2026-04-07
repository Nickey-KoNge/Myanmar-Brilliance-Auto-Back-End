import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { VehicleModelService } from './vehicle-model.service';
import { CreateVehicleModelDto } from './dtos/create-vehicle-model.dto';
import { PaginateVehicleModelDto } from './dtos/paginate-vehicle-model.dto';

@Controller('vehicle-model')
@UseInterceptors(ClassSerializerInterceptor)
export class VehicleModelController {
  constructor(private readonly service: VehicleModelService) {}

  @Post()
  create(@Body() dto: CreateVehicleModelDto) {
    return this.service.create(dto);
  }

  @Get('list')
  findAll(@Query() query: PaginateVehicleModelDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: any) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
