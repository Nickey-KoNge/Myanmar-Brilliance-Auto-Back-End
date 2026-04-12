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
  UseGuards,
} from '@nestjs/common';
import { MasterCompanyStationsService } from './master-company.stations.service';
import { CreateStationsDto } from './dtos/create-stations.dto';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { GetStationsSerialize } from '../stations/serialize/get-stations.serialize';
import { UpdateStationsDto } from './dtos/update-stations.dto';
import { PaginateStationsDto } from './dtos/paginate-station.dto';
import { FindStationsSerialize } from './serialize/find-stations.serialize';
import { AtGuard } from 'src/common/guards/at.guard';

interface AuthenticatedRequest {
  user?: {
    sub?: string;
    id?: string;
    staffName?: string;
    email?: string;
  };
}

@Controller('master-company/stations')
@UseGuards(AtGuard)
export class MasterCompanyStationsController {
  constructor(private readonly service: MasterCompanyStationsService) {}

  @Post()
  async create(
    @Body() dto: CreateStationsDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId =
      req.user?.id ||
      req.user?.staffName ||
      req.user?.email ||
      req.user?.sub ||
      'Unknown User';
    return await this.service.create(dto, userId);
  }

  @Serialize(FindStationsSerialize)
  @Get()
  async findAll(@Query() query: PaginateStationsDto) {
    return await this.service.findAll(query);
  }

  @Get(':id')
  @Serialize(GetStationsSerialize)
  async findOne(@Param('id') id: string) {
    return await this.service.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateStationsDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId =
      req.user?.id ||
      req.user?.staffName ||
      req.user?.email ||
      req.user?.sub ||
      'Unknown User';
    return await this.service.update(id, dto, userId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const userId =
      req.user?.id ||
      req.user?.staffName ||
      req.user?.email ||
      req.user?.sub ||
      'Unknown User';
    return await this.service.remove(id, userId);
  }

  @Post('restore/:auditId')
  async restore(
    @Param('auditId') auditId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId =
      req.user?.id ||
      req.user?.staffName ||
      req.user?.email ||
      req.user?.sub ||
      'Unknown User';
    return await this.service.restoreStation(auditId, userId);
  }
}
