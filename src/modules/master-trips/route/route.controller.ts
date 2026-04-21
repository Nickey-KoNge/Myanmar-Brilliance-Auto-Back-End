import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { RouteService } from './route.service';
import { CreateRouteDto } from './dtos/create-route.dto';
import { UpdateRouteDto } from './dtos/update-route.dto';
import { AtGuard } from 'src/common/guards/at.guard';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { FindRouteSerialize } from './serialize/find-route.serialize';
import { PaginateRouteDto } from './dtos/paginate-route.dto';

@Controller('master-trips/routes')
//@UseGuards(AtGuard)
export class RouteController {
  constructor(private readonly routeService: RouteService) {}

  @Post()
  create(@Body() createRouteDto: CreateRouteDto) {
    return this.routeService.create(createRouteDto);
  }

  @Serialize(FindRouteSerialize)
  @Get()
  findAll(@Query() query:PaginateRouteDto) {
    return this.routeService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.routeService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRouteDto: UpdateRouteDto) {
    return this.routeService.update(id, updateRouteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.routeService.remove(id);
  }
}
