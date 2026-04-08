import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  FindOptionsWhere,
  ILike,
  Between,
  MoreThanOrEqual,
  LessThanOrEqual,
  SelectQueryBuilder,
} from 'typeorm';
import { Audit } from './entities/audit.entity';
import { AuditGateway } from './audit.gateway';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';

export interface PaginateAuditQuery {
  limit?: number | string;
  page?: number | string;
  entity_name?: string;
  search?: string;
  entity_id?: string;
  startDate?: string;
  endDate?: string;
}

export interface UserActivityStat {
  staffName: string;
  actionCount: string;
  action: string;
}

export interface ActionTypeStat {
  action: string;
  actionCount: string;
}

export interface ModuleActivityStat {
  entity_name: string;
  actionCount: string;
}

export interface DashboardSummary {
  totalLogs: number;
  activeUsers: number;
  topModule: string;
  criticalActions: number;
}

@Injectable()
export class MasterAuditService {
  constructor(
    @InjectRepository(Audit)
    private readonly auditRepository: Repository<Audit>,
    private readonly auditGateway: AuditGateway,
  ) {}

  async logAction(
    entity_name: string,
    entity_id: string,
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE',
    old_values: Record<string, unknown> | null = null,
    new_values: Record<string, unknown> | null = null,
    performed_by: string = 'system',
  ) {
    const audit = this.auditRepository.create({
      entity_name,
      entity_id,
      action,
      old_values,
      new_values,
      performed_by,
    });
    await this.auditRepository.save(audit);

    if (action === 'DELETE') {
      this.auditGateway.sendSecurityAlert(
        `WARNING: ${performed_by} deleted data in ${entity_name}!`,
        audit,
      );
    }
  }

  async findAll(query: PaginateAuditQuery) {
    const limit = Number(query.limit) || 10;
    const page = Number(query.page) || 1;
    const skip = (page - 1) * limit;

    const dateCondition: FindOptionsWhere<Audit> = {};
    if (query.startDate && query.endDate) {
      dateCondition.created_at = Between(
        new Date(query.startDate),
        new Date(`${query.endDate}T23:59:59.999Z`),
      );
    } else if (query.startDate) {
      dateCondition.created_at = MoreThanOrEqual(new Date(query.startDate));
    } else if (query.endDate) {
      dateCondition.created_at = LessThanOrEqual(
        new Date(`${query.endDate}T23:59:59.999Z`),
      );
    }

    const basicCondition: FindOptionsWhere<Audit> = { ...dateCondition };

    if (query.entity_name) {
      basicCondition.entity_name = ILike(`%${query.entity_name}%`);
    }
    if (query.entity_id) {
      basicCondition.entity_id = query.entity_id;
    }

    let finalWhere: FindOptionsWhere<Audit> | FindOptionsWhere<Audit>[] =
      basicCondition;

    if (query.search) {
      const searchKeyword = `%${query.search}%`;
      finalWhere = [
        { ...basicCondition, entity_name: ILike(searchKeyword) },

        {
          ...basicCondition,
          action: ILike(searchKeyword),
        } as FindOptionsWhere<Audit>,
        { ...basicCondition, performed_by: ILike(searchKeyword) },
      ];
    }

    const [data, total] = await this.auditRepository.findAndCount({
      where: finalWhere,
      order: { created_at: 'DESC' },
      take: limit,
      skip: skip,
    });

    return {
      data,
      total,
      totalPages: Math.ceil(total / limit) || 1,
      currentPage: page,
    };
  }

  private applyDateFilter(
    qb: SelectQueryBuilder<Audit>,
    startDate?: string,
    endDate?: string,
  ) {
    if (startDate) {
      qb.andWhere('audit.created_at >= :startDate', {
        startDate: new Date(startDate),
      });
    }
    if (endDate) {
      qb.andWhere('audit.created_at <= :endDate', {
        endDate: new Date(`${endDate}T23:59:59.999Z`),
      });
    }
    return qb;
  }

  async getUserActivityStats(
    startDate?: string,
    endDate?: string,
  ): Promise<UserActivityStat[]> {
    let qb = this.auditRepository
      .createQueryBuilder('audit')
      .select('audit.performed_by', 'staffName')
      .addSelect('COUNT(audit.id)', 'actionCount')
      .addSelect('audit.action', 'action')
      .groupBy('audit.performed_by')
      .addGroupBy('audit.action')
      .orderBy('"actionCount"', 'DESC')
      .limit(10);

    qb = this.applyDateFilter(qb, startDate, endDate);
    return await qb.getRawMany();
  }

  async getActionTypeStats(
    startDate?: string,
    endDate?: string,
  ): Promise<ActionTypeStat[]> {
    let qb = this.auditRepository
      .createQueryBuilder('audit')
      .select('audit.action', 'action')
      .addSelect('COUNT(audit.id)', 'actionCount')
      .groupBy('audit.action');

    qb = this.applyDateFilter(qb, startDate, endDate);
    return await qb.getRawMany();
  }

  async getModuleActivityStats(
    startDate?: string,
    endDate?: string,
  ): Promise<ModuleActivityStat[]> {
    let qb = this.auditRepository
      .createQueryBuilder('audit')
      .select('audit.entity_name', 'entity_name')
      .addSelect('COUNT(audit.id)', 'actionCount')
      .groupBy('audit.entity_name')
      .orderBy('"actionCount"', 'DESC')
      .limit(10);

    qb = this.applyDateFilter(qb, startDate, endDate);
    return await qb.getRawMany();
  }

  async findByEntity(entityName: string, entityId: string) {
    return await this.auditRepository.find({
      where: { entity_name: entityName, entity_id: entityId },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(auditId: string) {
    const record = await this.auditRepository.findOne({
      where: { id: auditId },
    });
    if (!record) throw new NotFoundException('Audit record not found');
    return record;
  }

  async getDashboardSummary(
    startDate?: string,
    endDate?: string,
  ): Promise<DashboardSummary> {
    const whereCondition: FindOptionsWhere<Audit> = {};
    if (startDate && endDate) {
      whereCondition.created_at = Between(
        new Date(startDate),
        new Date(`${endDate}T23:59:59.999Z`),
      );
    } else if (startDate) {
      whereCondition.created_at = MoreThanOrEqual(new Date(startDate));
    } else if (endDate) {
      whereCondition.created_at = LessThanOrEqual(
        new Date(`${endDate}T23:59:59.999Z`),
      );
    }

    const totalLogs = await this.auditRepository.count({
      where: whereCondition,
    });

    let activeUsersQb = this.auditRepository
      .createQueryBuilder('audit')
      .select('COUNT(DISTINCT audit.performed_by)', 'count');
    activeUsersQb = this.applyDateFilter(activeUsersQb, startDate, endDate);
    const activeUsersQuery = await activeUsersQb.getRawOne<{
      count: string | number;
    }>();
    const activeUsers = Number(activeUsersQuery?.count || 0);

    let topModuleQb = this.auditRepository
      .createQueryBuilder('audit')
      .select('audit.entity_name', 'module')
      .addSelect('COUNT(audit.id)', 'count')
      .groupBy('audit.entity_name')
      .orderBy('"count"', 'DESC')
      .limit(1);
    topModuleQb = this.applyDateFilter(topModuleQb, startDate, endDate);
    const topModuleQuery = await topModuleQb.getRawOne<{ module: string }>();
    const topModule = topModuleQuery?.module
      ? topModuleQuery.module.charAt(0).toUpperCase() +
        topModuleQuery.module.slice(1)
      : 'None';

    const criticalActions = await this.auditRepository.count({
      // 🛑 any ကို ဖယ်ရှားပြီး Object တစ်ခုလုံးကို Type သတ်မှတ်ပေးလိုက်ပါသည်
      where: { ...whereCondition, action: 'DELETE' } as FindOptionsWhere<Audit>,
    });

    return { totalLogs, activeUsers, topModule, criticalActions };
  }
  async exportToExcel(res: Response, query: PaginateAuditQuery) {
    const dateCondition: FindOptionsWhere<Audit> = {};
    if (query.startDate && query.endDate) {
      dateCondition.created_at = Between(
        new Date(query.startDate),
        new Date(`${query.endDate}T23:59:59.999Z`),
      );
    }

    const where: FindOptionsWhere<Audit> = { ...dateCondition };
    if (query.entity_name) where.entity_name = query.entity_name;
    if (query.search) where.action = query.search; // Action Filter အတွက် သုံးနိုင်သည်

    const logs = await this.auditRepository.find({
      where,
      order: { created_at: 'DESC' },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Audit Logs');

    worksheet.columns = [
      { header: 'Date & Time', key: 'date', width: 25 },
      { header: 'User Name', key: 'user', width: 20 },
      { header: 'Action', key: 'action', width: 15 },
      { header: 'Module Name', key: 'module', width: 20 },
      { header: 'Entity ID', key: 'id', width: 35 },
    ];

    logs.forEach((log) => {
      worksheet.addRow({
        date: log.created_at.toLocaleString(),
        user: log.performed_by,
        action: log.action,
        module: log.entity_name,
        id: log.entity_id,
      });
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=Audit_Report_${Date.now()}.xlsx`,
    );

    await workbook.xlsx.write(res);
    res.end();
  }
}
