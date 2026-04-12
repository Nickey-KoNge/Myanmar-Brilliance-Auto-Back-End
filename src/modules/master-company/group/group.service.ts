import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Group } from './entities/group.entity';
import { CreateGroupDto } from './dtos/create-group.dto';
import { UpdateGroupDto } from './dtos/update-group.dto';
import { PaginateGroupDto } from './dtos/paginate-group.dto';
import { MasterAuditService } from 'src/modules/master-audit/audit/audit.service';
import { getChanges } from '../../../common/utils/object.util';

interface QueryParams {
  limit?: number | string;
  page?: number | string;
  lastId?: string;
  lastCreatedAt?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  station_id?: string;
}

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group)
    private readonly repo: Repository<Group>,
    private readonly auditService: MasterAuditService,
  ) {}

  async create(dto: CreateGroupDto, userId: string): Promise<Group> {
    try {
      const newGroup = this.repo.create(dto);
      const savedGroup = await this.repo.save(newGroup);
      await this.auditService.logAction(
        'groups',
        savedGroup.id,
        'CREATE',
        null,
        { ...dto },
        userId,
      );
      return savedGroup;
    } catch {
      throw new InternalServerErrorException('Failed to create group');
    }
  }

  async findAll(query: PaginateGroupDto) {
    const {
      limit = 10,
      page = 1,
      lastId,
      lastCreatedAt,
      search,
      startDate,
      endDate,
      station_id: stationId,
    } = query as unknown as QueryParams;

    const queryBuilder = this.repo.createQueryBuilder('groups');

    queryBuilder.leftJoinAndSelect('groups.stations', 'stations');

    if (stationId) {
      queryBuilder.andWhere('groups.station_id = :stationId', {
        stationId: String(stationId),
      });
    }

    if (search) {
      queryBuilder.andWhere(
        `(groups.group_name ILike :search 
          OR groups.group_type ILike :search 
          OR groups.description ILike :search)`,
        { search: `%${String(search)}%` },
      );
    }

    if (startDate || endDate) {
      if (startDate)
        queryBuilder.andWhere('groups.createdAt >= :startDate', {
          startDate: `${String(startDate)} 00:00:00`,
        });
      if (endDate)
        queryBuilder.andWhere('groups.createdAt <= :endDate', {
          endDate: `${String(endDate)} 23:59:59`,
        });
    }

    if (lastId && lastCreatedAt && lastId !== 'undefined') {
      queryBuilder.andWhere(
        '(groups.createdAt < :lastCreatedAt OR (groups.createdAt = :lastCreatedAt AND groups.id < :lastId))',
        {
          lastCreatedAt: String(lastCreatedAt),
          lastId: String(lastId),
        },
      );
    } else {
      const skip = (Number(page) - 1) * Number(limit);
      queryBuilder.skip(skip);
    }

    const rawData = await queryBuilder
      .orderBy('groups.createdAt', 'DESC')
      .addOrderBy('groups.id', 'DESC')
      .take(Number(limit))
      .getMany();

    const data = rawData.map((group) => ({
      id: group.id,
      group_name: group.group_name,
      group_type: group.group_type,
      station_id: group.station_id,
      station_name: group.stations?.station_name || null,
      description: group.description,
      status: group.status,
    }));

    const hasFilters = !!(search || startDate || endDate || stationId);
    const total = await this.getOptimizedCount(queryBuilder, hasFilters);

    const activeCount = await this.repo.count({
      where: { status: 'Active' },
    });
    const inactiveCount = total - activeCount > 0 ? total - activeCount : 0;

    let lastEditedBy = 'Unknown';
    try {
      const lastAudit = await this.repo.query<{ performed_by: string }[]>(
        `SELECT performed_by FROM master_audit.audit WHERE entity_name = 'groups' ORDER BY created_at DESC LIMIT 1`,
      );
      if (lastAudit && lastAudit.length > 0) {
        lastEditedBy = lastAudit[0].performed_by;
      }
    } catch (auditError) {
      console.log('Error fetching last audit:', auditError);
    }

    return {
      data,
      total,
      totalPages: Math.ceil(total / Number(limit)) || 1,
      currentPage: Number(page),
      activeCount,
      inactiveCount,
      lastEditedBy,
    };
  }

  private async getOptimizedCount(
    queryBuilder: SelectQueryBuilder<Group>,
    hasFilters: boolean,
  ): Promise<number> {
    if (hasFilters) {
      return await queryBuilder.getCount();
    }

    try {
      const result = await this.repo.query<{ estimate: string }[]>(
        `SELECT reltuples::bigint AS estimate FROM pg_class c 
         JOIN pg_namespace n ON n.oid = c.relnamespace 
         WHERE n.nspname = 'master_company' AND c.relname = 'groups'`,
      );

      const estimate = result?.[0]?.estimate ? Number(result[0].estimate) : 0;
      return estimate < 1000 ? await this.repo.count() : estimate;
    } catch {
      return await this.repo.count();
    }
  }

  async findOne(id: string): Promise<Group> {
    const group = await this.repo.findOne({
      where: { id },
      relations: ['stations'],
      select: {
        id: true,
        group_name: true,
        group_type: true,
        description: true,
        station_id: true,
        stations: { id: true, station_name: true },
      },
    });
    if (!group) throw new NotFoundException(`Group with ID ${id} not found`);
    return group;
  }

  async update(
    id: string,
    dto: UpdateGroupDto,
    userId: string,
  ): Promise<Group> {
    const oldGroup = await this.findOne(id);
    await this.repo.update(id, dto);

    const updatedGroup = await this.findOne(id);

    const { oldVals, newVals } = getChanges(
      oldGroup as unknown as Record<string, unknown>,
      dto as unknown as Record<string, unknown>,
    );
    if (Object.keys(newVals).length > 0) {
      await this.auditService.logAction(
        'groups',
        id,
        'UPDATE',
        oldVals,
        newVals,
        userId,
      );
    }

    return updatedGroup;
  }

  async remove(id: string, userId: string): Promise<{ id: string }> {
    const groupToDelete = await this.findOne(id);
    try {
      await this.repo.remove(groupToDelete);

      await this.auditService.logAction(
        'groups',
        id,
        'DELETE',
        { ...groupToDelete },
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
          'Cannot delete this Group because it contains active staff or stations. Please remove or reassign them first.',
        );
      }
      throw error;
    }
  }
  async restoreGroup(auditId: string, userId: string): Promise<Group> {
    const auditRecord = await this.auditService.findOne(auditId);

    if (auditRecord.entity_name !== 'groups') {
      throw new BadRequestException('This audit record is not for groups');
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

    const existingGroup = await this.repo.findOne({
      where: { id: auditRecord.entity_id },
      withDeleted: true,
    });

    let restored: Group;

    const toPlainObject = (data: unknown): Record<string, unknown> => {
      return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
    };

    // BEFORE STATE
    const beforeState =
      existingGroup !== null
        ? toPlainObject(existingGroup)
        : { status: 'Permanently Deleted / Not Exists' };

    if (existingGroup) {
      Object.assign(existingGroup, safeDataToRestore);

      const groupWithSoftDelete = existingGroup as Group & {
        deletedAt?: Date | null;
        deleted_at?: Date | null;
      };

      if (groupWithSoftDelete.deletedAt || groupWithSoftDelete.deleted_at) {
        groupWithSoftDelete.deletedAt = null;
        groupWithSoftDelete.deleted_at = null;
        restored = await this.repo.recover(existingGroup);
      } else {
        restored = await this.repo.save(existingGroup);
      }
    } else {
      const newGroup = this.repo.create(safeDataToRestore);
      restored = await this.repo.save(newGroup);
    }

    const afterState = {
      id: restored.id,
      ...safeDataToRestore,
    };

    // AUDIT LOG
    await this.auditService.logAction(
      'groups',
      restored.id,
      'RESTORE',
      beforeState,
      afterState,
      userId,
    );

    return restored;
  }
}
