//src/modules/master-company/branches/master-company.branches.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CreateBranchesDto } from './dtos/create-branches.dto';
import { MasterCompanyBranchesService } from './master-company.branches.service';
import { UpdateBranchesDto } from './dtos/update-branches.dto';

//extra import for serialize
import { FindBranchesSerialize } from './serialize/find-branches.serialize';
import { PaginateBranchesDto } from './dtos/paginate-branches.dto';
import { GetBranchesSerialize } from './serialize/get-branches.serialize';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { AtGuard } from 'src/common/guards/at.guard';

interface AuthenticatedRequest {
  user?: {
    sub?: string;
    id?: string;
    staffName?: string;
    email?: string;
  };
}
@Controller('master-company/branches')
@UseGuards(AtGuard)
export class MasterCompanyBranchesController {
  constructor(private readonly service: MasterCompanyBranchesService) {}

  @Post()
  async create(
    @Body() dto: CreateBranchesDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId =
      req.user?.staffName || req.user?.email || req.user?.sub || 'Unknown User';
    return await this.service.create(dto, userId);
  }
  @Serialize(FindBranchesSerialize)
  @Get()
  async findAll(@Query() query: PaginateBranchesDto) {
    return await this.service.findAll(query);
  }

  @Get(':id')
  @Serialize(GetBranchesSerialize)
  async findOne(@Param('id') id: string) {
    return await this.service.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateBranchesDto,
    @Req() req: AuthenticatedRequest,
  ) {
    // return await this.service.update(id, dto);
    const userId =
      req.user?.staffName || req.user?.email || req.user?.sub || 'Unknown User';
    return await this.service.update(id, dto, userId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    // return await this.service.remove(id);
    const userId =
      req.user?.staffName || req.user?.email || req.user?.sub || 'Unknown User';
    return await this.service.remove(id, userId);
  }
  @Post('restore/:auditId')
  async restore(
    @Param('auditId') auditId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId =
      req.user?.staffName || req.user?.email || req.user?.sub || 'Unknown User';
    return await this.service.restoreBranch(auditId, userId);
  }
}
