import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TripFinanceService } from './trip-finance.service';
import { CreateTripFinanceDto } from './dtos/create-trip-finance.dto';
import { PaginateTripFinanceDto } from './dtos/paginate-trip-finance.dto';
import { TripFinance } from './entities/trip-finance.entity';
import { AtGuard } from 'src/common/guards/at.guard';

@Controller('master-rental/trip-finance')
@UseGuards(AtGuard)
export class TripFinanceController {
  constructor(private readonly tripFinanceService: TripFinanceService) {}

  @Post()
  async create(@Body() createDto: CreateTripFinanceDto): Promise<TripFinance> {
    return await this.tripFinanceService.create(createDto);
  }

  @Get()
  async findAll(@Query() query: PaginateTripFinanceDto) {
    return await this.tripFinanceService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<TripFinance> {
    return await this.tripFinanceService.findOne(id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.tripFinanceService.remove(id);
    return { message: 'Trip finance record deleted successfully' };
  }
}
