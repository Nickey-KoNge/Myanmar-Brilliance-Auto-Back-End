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
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AtGuard } from 'src/common/guards/at.guard';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { CreateRentalOperationDto } from './dtos/create-rental-operation.dto';
import { FindRentalOperationSerialize } from './serialize/find-rental-operation.serialize';
import { GetRentalOperationSerialize } from './serialize/get-rental-operation.serialize';
import { RentalOpService } from './rental-op.service';
import { UpdateRentalOperationDto } from './dtos/update-rental-operation.dto';
import { PaginateRentalOperationDto } from './dtos/paginate-rental-operation.dto';
import { GenerateOpsByStationDto } from './dtos/generate-ops.dto';

interface AuthenticatedRequest {
  user?: {
    sub?: string;
    id?: string;
    userId: string;
    staffName?: string;
    email?: string;
  };
}

@Controller('master-rental/rental-operation')
@UseGuards(AtGuard)
export class RentalOpController {
  constructor(private readonly service: RentalOpService) {}

  @Post()
  async create(
    @Body() dto: CreateRentalOperationDto,
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

  @Get()
  @Serialize(FindRentalOperationSerialize)
  async findAll(@Query() query: PaginateRentalOperationDto) {
    return await this.service.findAll(query);
  }

  @Get(':id')
  @Serialize(GetRentalOperationSerialize)
  async findOne(@Param('id') id: string) {
    return await this.service.findOne(id);
  }

  @Patch(':id')
  @Serialize(GetRentalOperationSerialize)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateRentalOperationDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const ID = req.user?.userId || req.user?.id || req.user?.sub;

    if (!ID) {
      throw new UnauthorizedException('User ID (userId) not found in request');
    }

    const auditUserName =
      req.user?.staffName || req.user?.email || 'Unknown User';

    return await this.service.update(id, dto, auditUserName, ID);
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

    // မှတ်ချက် - Service ထဲတွင် restoreRentalOperation method ရေးသားထားရန် လိုအပ်ပါသည်
    return await this.service.restoreRentalOperation(auditId, userId);
  }

  //operation generate ops by station
  @Post('generate-by-station')
  async generateOpsByStation(
    @Body() dto: GenerateOpsByStationDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const ID = req.user?.id;

    if (!ID) {
      throw new UnauthorizedException('User ID (userId) not found in request');
    }

    const userId =
      req.user?.staffName || req.user?.email || req.user?.sub || 'Unknown User';
    return await this.service.generateOpsByStationAndRoute(dto, userId, ID);
  }
}
