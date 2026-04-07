// src/modules/master-audit/audit/master-audit.controller.ts
import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';

import { AtGuard } from 'src/common/guards/at.guard';
import { MasterAuditService } from './audit.service';
import type {
  PaginateAuditQuery,
  UserActivityStat,
  ActionTypeStat,
  ModuleActivityStat,
} from './audit.service';
@Controller('master-audit')
@UseGuards(AtGuard)
export class MasterAuditController {
  constructor(private readonly auditService: MasterAuditService) {}

  @Get()
  async findAll(@Query() query: PaginateAuditQuery) {
    return await this.auditService.findAll(query);
  }
  @Get('analytics/summary')
  async getDashboardSummary(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return await this.auditService.getDashboardSummary(startDate, endDate);
  }
  @Get('analytics/user-activity')
  async getUserActivityStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<UserActivityStat[]> {
    return await this.auditService.getUserActivityStats(startDate, endDate);
  }
  @Get('analytics/action-types')
  async getActionTypeStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<ActionTypeStat[]> {
    return await this.auditService.getActionTypeStats(startDate, endDate);
  }
  @Get('analytics/module-activity')
  async getModuleActivityStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<ModuleActivityStat[]> {
    return await this.auditService.getModuleActivityStats(startDate, endDate);
  }
  @Get(':entityName/:entityId')
  async findByEntity(
    @Param('entityName') entityName: string,
    @Param('entityId') entityId: string,
  ) {
    return await this.auditService.findByEntity(entityName, entityId);
  }
}
