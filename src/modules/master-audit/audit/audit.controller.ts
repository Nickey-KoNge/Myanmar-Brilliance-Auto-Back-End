// src/modules/master-audit/audit/master-audit.controller.ts
import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';

import { AtGuard } from 'src/common/guards/at.guard';
import { MasterAuditService } from './audit.service';
import type { PaginateAuditQuery, UserActivityStat, ActionTypeStat, ModuleActivityStat } from './audit.service';
@Controller('master-audit')
@UseGuards(AtGuard)
export class MasterAuditController {
  constructor(private readonly auditService: MasterAuditService) {}

  @Get()
  async findAll(@Query() query: PaginateAuditQuery) {
    return await this.auditService.findAll(query);
  }
  @Get('analytics/user-activity')
  async getUserActivityStats(): Promise<UserActivityStat[]> {
    return await this.auditService.getUserActivityStats();
  }
  @Get('analytics/action-types')
  async getActionTypeStats(): Promise<ActionTypeStat[]> {
    return await this.auditService.getActionTypeStats();
  }
  @Get('analytics/module-activity')
  async getModuleActivityStats(): Promise<ModuleActivityStat[]> {
    return await this.auditService.getModuleActivityStats();
  }
  @Get(':entityName/:entityId')
  async findByEntity(
    @Param('entityName') entityName: string,
    @Param('entityId') entityId: string,
  ) {
    return await this.auditService.findByEntity(entityName, entityId);
  }
}
