// src/modules/master-company/branches/master-company.branches.service.ts

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Branches } from './entities/branches.entity';
// import { Create } from 'sharp';
import { CreateBranchesDto } from './dtos/create-branches.dto';
import { UpdateBranchesDto } from './dtos/update-branches.dto';
import { OpService } from '../../../common/service/op.service';
import { PaginateBranchesDto } from './dtos/paginate-branches.dto';
import { MasterAuditService } from 'src/modules/master-audit/audit/audit.service';
import { getChanges } from '../../../common/utils/object.util';

@Injectable()
export class MasterCompanyBranchesService {
  constructor(
    private readonly opService: OpService,

    @InjectRepository(Branches)
    private readonly branchesRepository: Repository<Branches>,
    private readonly auditService: MasterAuditService,
  ) {}

  async create(dto: CreateBranchesDto, userId: string): Promise<Branches> {
    const newBranch = await this.opService.create<Branches>(
      this.branchesRepository,
      dto,
    );

    await this.auditService.logAction(
      'branches',
      newBranch.id,
      'CREATE',
      null,
      { ...dto },
      userId,
    );

    return newBranch;
  }

  async findAll(query: PaginateBranchesDto) {
    const {
      limit,
      page,
      lastId,
      lastCreatedAt,
      search,
      startDate,
      endDate,
      company_id: companyId,
    } = query;

    const queryBuilder = this.branchesRepository.createQueryBuilder('branches');

    queryBuilder.leftJoinAndSelect('branches.company', 'company');

    if (companyId) {
      queryBuilder.andWhere('branches.company = :companyId', { companyId });
    }
    // 1. Dynamic Filters (Search & Date Range)
    if (search) {
      queryBuilder.andWhere(
        `(branches.branches_name ILike :search 
          OR branches.description ILike :search 
          OR branches.phone ILike :search
          OR branches.address ILike :search
          OR branches.city ILike :search
          OR branches.division ILike :search)`,
        { search: `%${search}%` },
      );
    }

    if (startDate || endDate) {
      if (startDate)
        queryBuilder.andWhere('branches.created_at >= :startDate', {
          startDate: `${startDate} 00:00:00`,
        });
      if (endDate)
        queryBuilder.andWhere('branches.created_at <= :endDate', {
          endDate: `${endDate} 23:59:59`,
        });
    }

    if (lastId && lastCreatedAt && lastId !== 'undefined') {
      queryBuilder.andWhere(
        '(branches.created_at < :lastCreatedAt OR (branches.created_at = :lastCreatedAt AND branches.id < :lastId))',
        { lastCreatedAt, lastId },
      );
    } else {
      const skip = (page - 1) * limit;
      queryBuilder.skip(skip);
    }

    const rawData = await queryBuilder
      .orderBy('branches.created_at', 'DESC')
      .addOrderBy('branches.id', 'DESC')
      .take(limit)
      .getMany();

    const data = rawData.map((branch) => ({
      id: branch.id,
      branches_name: branch.branches_name,
      gps_location: branch.gps_location,
      description: branch.description,
      phone: branch.phone,
      city: branch.city,
      division: branch.division,
      address: branch.address,
      company_id: branch.company?.id || null,
      company_name: branch.company?.company_name || null,
      status: branch.status,
    }));

    const hasFilters = !!(search || startDate || endDate || companyId);
    const total = await this.getOptimizedCount(queryBuilder, hasFilters);

    //active and inactive count
    const activeCount = await this.branchesRepository.count({
      where: { status: 'Active' },
    });
    const inactiveCount = total - activeCount > 0 ? total - activeCount : 0;

    let lastEditedBy = 'Unknown';
    try {
      const lastAudit = await this.branchesRepository.query<
        { performed_by: string }[]
      >(
        `SELECT performed_by FROM master_audit.audit WHERE entity_name = 'branches' ORDER BY created_at DESC LIMIT 1`,
      );
      if (lastAudit && lastAudit.length > 0) {
        lastEditedBy = lastAudit[0].performed_by;
      }
    } catch (error) {
      console.log('Error fetching last audit:', error);
    }
    return {
      data,
      total,
      totalPages: Math.ceil(total / limit) || 1,
      currentPage: page,
      activeCount,
      inactiveCount,
      lastEditedBy,
    };
  }
  private async getOptimizedCount(
    queryBuilder: SelectQueryBuilder<Branches>,
    hasFilters: boolean,
  ): Promise<number> {
    if (hasFilters) {
      return await queryBuilder.getCount();
    }

    try {
      const result = await this.branchesRepository.query<
        { estimate: string }[]
      >(
        `SELECT reltuples::bigint AS estimate FROM pg_class c 
         JOIN pg_namespace n ON n.oid = c.relnamespace 
         WHERE n.nspname = 'master_company' AND c.relname = 'branches'`,
      );

      const estimate = result?.[0]?.estimate ? Number(result[0].estimate) : 0;
      return estimate < 1000 ? await this.branchesRepository.count() : estimate;
    } catch {
      return await this.branchesRepository.count();
    }
  }
  async findOne(id: string): Promise<Branches> {
    const branch = await this.branchesRepository.findOne({
      where: { id },
      relations: { company: true, staff: true, stations: true },
      select: {
        id: true,
        branches_name: true,
        gps_location: true,
        description: true,
        phone: true,
        city: true,
        address: true,
        division: true,
        status: true,
        company: { id: true, company_name: true },
      },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }
    return branch;
  }

  async update(
    id: string,
    dto: UpdateBranchesDto,
    userId: string,
  ): Promise<Branches> {
    const oldBranch = await this.findOne(id);
    const updatedBranch = await this.opService.update<Branches>(
      this.branchesRepository,
      id,
      dto,
    );

    const { oldVals, newVals } = getChanges(
      oldBranch as unknown as Record<string, unknown>,
      dto as unknown as Record<string, unknown>,
    );

    if (Object.keys(newVals).length > 0) {
      await this.auditService.logAction(
        'branches',
        id,
        'UPDATE',
        oldVals,
        newVals,
        userId,
      );
    }

    return updatedBranch;
  }
  async remove(id: string, userId: string): Promise<{ id: string }> {
    const branchToDelete = await this.findOne(id);

    try {
      await this.opService.remove<Branches>(this.branchesRepository, id);

      await this.auditService.logAction(
        'branches',
        id,
        'DELETE',
        { ...branchToDelete },
        null,
        userId,
      );

      return { id };
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as Record<string, unknown>).code === '23503'
      ) {
        throw new BadRequestException(
          'Cannot delete this branch because it contains active staff or stations. Please remove or reassign them first.',
        );
      }
      throw error;
    }
  }
  async restoreBranch(auditId: string, userId: string): Promise<Branches> {
    const auditRecord = await this.auditService.findOne(auditId);

    if (auditRecord.entity_name !== 'branches') {
      throw new BadRequestException('This audit record is not for branches');
    }

    const rawOldValues = (
      typeof auditRecord.old_values === 'string'
        ? JSON.parse(auditRecord.old_values)
        : auditRecord.old_values
    ) as Record<string, unknown> | null;

    if (!rawOldValues) {
      throw new BadRequestException(
        'No old data available to restore from this action',
      );
    }

    const safeDataToRestore = JSON.parse(
      JSON.stringify(rawOldValues),
    ) as Record<string, unknown>;
    delete safeDataToRestore['deleted_at'];
    delete safeDataToRestore['updated_at'];

    const existingBranch = await this.branchesRepository.findOne({
      where: { id: auditRecord.entity_id },
      withDeleted: true,
    });

    let restored: Branches;

    const toPlainObject = (data: unknown): Record<string, unknown> => {
      return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
    };

    // BEFORE STATE
    const beforeState =
      existingBranch !== null
        ? toPlainObject(existingBranch)
        : { status: 'Permanently Deleted / Not Exists' };

    if (existingBranch) {
      Object.assign(existingBranch, safeDataToRestore);

      if (existingBranch.deleted_at) {
        restored = await this.branchesRepository.recover(existingBranch);
      } else {
        restored = await this.branchesRepository.save(existingBranch);
      }
    } else {
      const newBranch = this.branchesRepository.create(safeDataToRestore);
      restored = await this.branchesRepository.save(newBranch);
    }

    const afterState = {
      id: restored.id,
      ...safeDataToRestore,
    };

    // AUDIT LOG
    await this.auditService.logAction(
      'branches',
      restored.id,
      'RESTORE',
      beforeState,
      afterState,
      userId,
    );

    return restored;
  }
}
