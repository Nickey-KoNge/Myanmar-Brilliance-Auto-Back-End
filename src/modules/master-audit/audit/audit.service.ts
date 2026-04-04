// src/modules/master-audit/audit/master-audit.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, ILike } from 'typeorm';
import { Audit } from './entities/audit.entity';
import { AuditGateway } from './audit.gateway';

export interface PaginateAuditQuery {
  limit?: number | string;
  page?: number | string;
  entity_name?: string;
  entity_id?: string;
}
export interface UserActivityStat {
  staffName: string;
  actionCount: string;
}
export interface ActionTypeStat {
  action: string;
  actionCount: string;
}

export interface ModuleActivityStat {
  entity_name: string;
  actionCount: string;
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
    // Security Rules စစ်ဆေးခြင်း
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

    //Filter by entity_name or entity_id if provided
    const whereCondition: FindOptionsWhere<Audit> = {};
    if (query.entity_name)
      whereCondition.entity_name = ILike(`%${query.entity_name}%`);
    if (query.entity_id) whereCondition.entity_id = query.entity_id;

    const [data, total] = await this.auditRepository.findAndCount({
      where: whereCondition,
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
  async getUserActivityStats(): Promise<UserActivityStat[]> {
    const rawData = await this.auditRepository
      .createQueryBuilder('audit')
      .select('audit.performed_by', 'staffName')
      .addSelect('COUNT(audit.id)', 'actionCount')
      .groupBy('audit.performed_by')
      .orderBy('"actionCount"', 'DESC')
      .limit(10)
      .getRawMany();
    return rawData as UserActivityStat[];
  }
  async getActionTypeStats() {
    const rawData = await this.auditRepository
      .createQueryBuilder('audit')
      .select('audit.action', 'action')
      .addSelect('COUNT(audit.id)', 'actionCount')
      .groupBy('audit.action')
      .getRawMany();
    return rawData as ActionTypeStat[];
  }
  async getModuleActivityStats() {
    const rawData = await this.auditRepository
      .createQueryBuilder('audit')
      .select('audit.entity_name', 'entity_name')
      .addSelect('COUNT(audit.id)', 'actionCount')
      .groupBy('audit.entity_name')
      .orderBy('"actionCount"', 'DESC')
      .limit(10)
      .getRawMany();
    return rawData as ModuleActivityStat[];
  }
}
