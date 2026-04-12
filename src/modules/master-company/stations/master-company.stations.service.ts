import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Stations } from './entities/stations.entity';
import { CreateStationsDto } from './dtos/create-stations.dto';
import { UpdateStationsDto } from './dtos/update-stations.dto';
import { OpService } from '../../../common/service/op.service';
import { PaginateStationsDto } from './dtos/paginate-station.dto';
import { Injectable } from '@nestjs/common';
import { MasterAuditService } from 'src/modules/master-audit/audit/audit.service';
// import { before } from 'node:test';
import { getChanges } from '../../../common/utils/object.util';

@Injectable()
export class MasterCompanyStationsService {
  constructor(
    private readonly opService: OpService,

    @InjectRepository(Stations)
    private readonly stationsRespository: Repository<Stations>,
    private readonly auditService: MasterAuditService,
  ) {}

  async create(dto: CreateStationsDto, userId: string): Promise<Stations> {
    const newStation = await this.opService.create<Stations>(
      this.stationsRespository,
      dto,
    );

    await this.auditService.logAction(
      'stations',
      newStation.id,
      'CREATE',
      null,
      { ...dto },
      userId,
    );

    return newStation;
  }

  async findAll(query: PaginateStationsDto) {
    //  return await this.stationsRespository.find();
    const {
      limit,
      page,
      lastId,
      lastCreatedAt,
      search,
      startDate,
      endDate,
      branch_id: branches_id,
    } = query;

    const queryBuilder =
      this.stationsRespository.createQueryBuilder('stations');

    queryBuilder.leftJoinAndSelect('stations.branch', 'branch');

    queryBuilder.addSelect(['branch.id', 'branch.branches_name']);

    if (branches_id) {
      queryBuilder.andWhere('stations.branch = :branches_id', { branches_id });
      //queryBuilder.andWhere('stations.branches_id = :branches_id', { branches_id });
    }

    if (search) {
      queryBuilder.andWhere(
        `(stations.station_name ILike :search 
                OR stations.description ILike :search 
                OR stations.phone ILike :search
                OR stations.address ILike :search
                OR stations.city ILike :search
                OR stations.division ILike :search)`,
        { search: `%${search}%` },
      );
    }

    if (startDate && endDate) {
      if (startDate)
        queryBuilder.andWhere('stations.created_at >= :startDate', {
          startDate,
        });
      if (endDate)
        queryBuilder.andWhere('stations.created_at <= :endDate', { endDate });
    }

    if (lastId && lastCreatedAt) {
      queryBuilder.andWhere(
        '(stations.created_at < :lastCreatedAt OR (stations.created_at = :lastCreatedAt AND stations.id < :lastId))',
        { lastCreatedAt, lastId },
      );
    } else {
      const skip = (page - 1) * limit;
      queryBuilder.skip(skip);
    }

    const rawData = await queryBuilder
      .orderBy('stations.created_at', 'DESC')
      .addOrderBy('stations.id', 'DESC')
      .take(limit)
      .getMany();

    const data = rawData.map((station) => ({
      id: station.id,
      station_name: station.station_name,
      gps_location: station.gps_location,
      description: station.description,
      phone: station.phone,
      city: station.city,
      address: station.address,
      division: station.division,
      status: station.status,
      branches_id: station.branch?.id || null,
      branches_name: station.branch?.branches_name || null,
    }));

    const hasFilters = !!(search || startDate || endDate || branches_id);
    const total = await this.getOptimizedCount(queryBuilder, hasFilters);

    return {
      data,
      total,
      totalPages: Math.ceil(total / limit) || 1,
      currentPage: page,
    };
  }

  private async getOptimizedCount(
    queryBuilder: SelectQueryBuilder<Stations>,
    hasFilters: boolean,
  ): Promise<number> {
    if (hasFilters) {
      return await queryBuilder.getCount();
    }

    try {
      const result = await this.stationsRespository.query<
        { estimate: string }[]
      >(
        `
                SELECT reltuples::bigint AS estimate FROM pg_class c 
                JOIN pg_namespace n ON n.oid = c.relnamespace
                WHERE n.nspname = 'master_company' AND c.relname = 'stations';
                `,
      );

      const estimate = result[0]?.estimate ? Number(result[0].estimate) : 0;
      return estimate < 1000
        ? await this.stationsRespository.count()
        : estimate;
    } catch {
      return await this.stationsRespository.count();
    }
  }
  //
  async findOne(id: string): Promise<Stations> {
    const station = await this.stationsRespository.findOne({
      where: { id },
      relations: { branch: true },
      select: {
        id: true,
        station_name: true,
        gps_location: true,
        description: true,
        phone: true,
        city: true,
        address: true,
        division: true,
        status: true,
        // branches_id:true,
        branch: {
          id: true,
          branches_name: true,
        },
      },
    });

    if (!station) {
      throw new Error('Station not found');
    }

    return station;
  }

  async update(
    id: string,
    dto: UpdateStationsDto,
    userId: string,
  ): Promise<Stations> {
    const oldStation = await this.findOne(id);
    const updatedStation = await this.opService.update<Stations>(
      this.stationsRespository,
      id,
      dto,
    );

    const { oldVals, newVals } = getChanges(
      oldStation as unknown as Record<string, unknown>,
      dto as unknown as Record<string, unknown>,
    );

    if (Object.keys(newVals).length > 0) {
      await this.auditService.logAction(
        'stations',
        id,
        'UPDATE',
        oldVals,
        newVals,
        userId,
      );
    }

    return updatedStation;
  }

  async remove(id: string, userId: string): Promise<{ id: string }> {
    const stationToDelete = await this.findOne(id);

    try {
      await this.opService.remove<Stations>(this.stationsRespository, id);
      await this.auditService.logAction(
        'stations',
        id,
        'DELETE',
        { ...stationToDelete },
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
        throw new Error(
          'Cannot delete this station because it contains active staff. Please remove or reassign them first.',
        );
      }
      throw error;
    }
  }

  async restoreStation(auditId: string, userId: string): Promise<Stations> {
    const auditRecord = await this.auditService.findOne(auditId);

    if (auditRecord.entity_name !== 'stations') {
      throw new Error('Invalid audit record for station restoration');
    }

    const rawOldValues = (
      typeof auditRecord.old_values === 'string'
        ? JSON.parse(auditRecord.old_values)
        : auditRecord.old_values
    ) as Record<string, unknown> | null;

    if (!rawOldValues) {
      throw new Error('No old data available to restore from this action');
    }

    const safeDataToRestore = JSON.parse(
      JSON.stringify(rawOldValues),
    ) as Record<string, unknown>;

    delete safeDataToRestore['deleted_at'];
    delete safeDataToRestore['deletedAt'];
    delete safeDataToRestore['created_at'];
    delete safeDataToRestore['createdAt'];
    delete safeDataToRestore['updated_at'];
    delete safeDataToRestore['updatedAt'];

    const exitingStation = await this.stationsRespository.findOne({
      where: { id: auditRecord.entity_id },
      withDeleted: true,
    });

    let restored: Stations;

    const toPlainObject = (data: unknown): Record<string, unknown> => {
      return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
    };

    const beforeState =
      exitingStation != null
        ? toPlainObject(exitingStation)
        : { status: 'Permanently Deleted / Not Exists' };

    if (exitingStation) {
      Object.assign(exitingStation, safeDataToRestore);

      const stationWithSoftDelete = exitingStation as Stations & {
        deletedAt?: Date | null;
        deleted_at?: Date | null;
      };

      if (stationWithSoftDelete.deletedAt || stationWithSoftDelete.deleted_at) {
        stationWithSoftDelete.deletedAt = null;
        stationWithSoftDelete.deleted_at = null;
        restored = await this.stationsRespository.save(exitingStation);
      } else {
        restored = await this.stationsRespository.save(exitingStation);
      }
    } else {
      const newStation = this.stationsRespository.create(safeDataToRestore);
      restored = await this.stationsRespository.save(newStation);
    }
    const afterState = {
      id: restored.id,
      ...safeDataToRestore,
    };

    await this.auditService.logAction(
      'stations',
      restored.id,
      'RESTORE',
      beforeState,
      afterState,
      userId,
    );

    return restored;
  }
}
