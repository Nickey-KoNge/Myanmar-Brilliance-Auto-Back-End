import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { TripPriceService } from './trip-price.service';
import { CreateTripPriceDto } from './dtos/create-trip-price.dto';
import { UpdateTripPriceDto } from './dtos/update-trip-price.dto';
import { PaginateTripPriceDto } from './dtos/paginate-trip-price.dto';
import { Query } from '@nestjs/common';
import { AtGuard } from 'src/common/guards/at.guard';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { FindTripPriceSerialize } from './serialize/find-trip-price.serialize';

@Controller('master-trips/trip-prices')
@UseGuards(AtGuard)
export class TripPriceController {
  constructor(private readonly tpService: TripPriceService) {}

  @Post()
  create(@Body() dto: CreateTripPriceDto) {
    return this.tpService.create(dto);
  }

  @Serialize(FindTripPriceSerialize)
  @Get()
  findAll(@Query() query: PaginateTripPriceDto) {
    return this.tpService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tpService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTripPriceDto) {
    return this.tpService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tpService.remove(id);
  }
}
