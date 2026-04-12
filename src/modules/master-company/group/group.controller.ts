import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  // ParseUUIDPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { GroupService } from './group.service';
import { CreateGroupDto } from './dtos/create-group.dto';
import { UpdateGroupDto } from './dtos/update-group.dto';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { FindGroupSerialize } from './serialize/find-group.serialize';
import { GetGroupSerialize } from './serialize/get-group.serialize';
import { PaginateGroupDto } from './dtos/paginate-group.dto';
import { AtGuard } from 'src/common/guards/at.guard';

interface AuthenticatedRequest {
  user?: {
    sub?: string;
    id?: string;
    staffName?: string;
    email?: string;
  };
}
@Controller('master-company/groups')
@UseGuards(AtGuard)
export class GroupController {
  constructor(private readonly service: GroupService) {}

  @Post()
  create(@Body() dto: CreateGroupDto, @Req() req: AuthenticatedRequest) {
    const userId =
      req.user?.staffName || req.user?.email || req.user?.sub || 'Unknown User';
    return this.service.create(dto, userId);
  }
  @Serialize(FindGroupSerialize)
  @Get()
  async findAll(@Query() query: PaginateGroupDto) {
    return await this.service.findAll(query);
  }

  @Get(':id')
  @Serialize(GetGroupSerialize)
  async findOne(@Param('id') id: string) {
    return await this.service.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateGroupDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId =
      req.user?.staffName || req.user?.email || req.user?.sub || 'Unknown User';
    return this.service.update(id, dto, userId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const userId =
      req.user?.staffName || req.user?.email || req.user?.sub || 'Unknown User';
    return this.service.remove(id, userId);
  }

  @Post('restore/:auditId')
  async restore(
    @Param('auditId') auditId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId =
      req.user?.staffName || req.user?.email || req.user?.sub || 'Unknown User';
    return await this.service.restoreGroup(auditId, userId);
  }
}
