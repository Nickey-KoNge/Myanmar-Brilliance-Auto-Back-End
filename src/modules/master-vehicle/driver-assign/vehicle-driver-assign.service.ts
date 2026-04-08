import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Driver } from 'src/modules/master-company/driver/entities/driver.entity';
import { DataSource, Repository } from 'typeorm';
import { Vehicle } from '../vehicle/entities/vehicle.entity';
import { CreateVehicleDriverAssignDto } from './dtos/create-vehicle-driver-assign.dto';
import { VehicleDriverAssign } from './entities/vehicle-driver-assign.entity';
import { SelectQueryBuilder } from 'typeorm/browser';
import { PaginateVehicleDriverAssignDto } from './dtos/paginate-vehicle-driver-assign.dto';

@Injectable()
export class VehicleDriverAssignService {
  constructor(
    @InjectRepository(Driver)
    private readonly driverRepo: Repository<Driver>,

    @InjectRepository(Vehicle)
    private readonly vehicleRepo: Repository<Vehicle>,

    @InjectRepository(VehicleDriverAssign)
    private readonly vehicleDriverAssignRepo: Repository<VehicleDriverAssign>,

    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateVehicleDriverAssignDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const [driver, vehicle] = await Promise.all([
        queryRunner.manager.findOneBy(Driver, { id: dto.driver_id }),
        queryRunner.manager.findOneBy(Vehicle, { id: dto.vehicle_id }),
      ]);

      if (!driver || !vehicle) {
        throw new NotFoundException('Driver or vehicle not found.');
      }

      await queryRunner.manager.update(
        VehicleDriverAssign,
        {
          vehicle_id: dto.vehicle_id,
          status: 'Active',
        },
        {
          status: 'Inactive',
          returned_at: new Date(),
        },
      );

      const newAssign = queryRunner.manager.create(VehicleDriverAssign, {
        driver_id: dto.driver_id,
        vehicle_id: dto.vehicle_id,
        assigned_at: dto.assigned_at || new Date(),
        start_odometer: dto.start_odometer || '0',
        station_id: dto.station_id || '0',
        status: 'Active',
      });

      const savedAssign = await queryRunner.manager.save(newAssign);

      await queryRunner.commitTransaction();

      return savedAssign;
    } catch (error) {
      await queryRunner.rollbackTransaction();

      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(query: PaginateVehicleDriverAssignDto) {
    const {
      page = 1,
      limit = 10,
      lastId,
      search,
      driver_id,
      vehicle_id,
      station_id,
      status,
      lastCreatedAt,
      startDate,
      endDate,
    } = query;

    const queryBuilder =
      this.vehicleDriverAssignRepo.createQueryBuilder('driver_assigns');
    queryBuilder.leftJoinAndSelect('driver_assigns.driver', 'drivers');
    queryBuilder.leftJoinAndSelect('driver_assigns.vehicle', 'vehicles');

    queryBuilder.addSelect([
      'drivers.id',
      'drivers.driver_name',
      'vehicles.id',
      'vehicles.vehicle_name',
    ]);

    if (driver_id) {
      queryBuilder.andWhere('driver_assigns.driver_name = :driver_id', {
        driver_id,
      });
    }

    if (vehicle_id) {
      queryBuilder.andWhere('driver_assigns.vehicle_name = :vehicle_id', {
        vehicle_id,
      });
    }

    if (search) {
      queryBuilder.andWhere(
        `(
          driver_assigns.driver_name ILike :search
          OR driver_assigns.vehicle_name ILike :search
          )`,
        { search: `%${search}%` },
      );
    }

    if (startDate || endDate) {
      if (startDate)
        queryBuilder.andWhere('driver_assigns.createdAt >= :startDate', {
          startDate: `${startDate} 00:00:00`,
        });
      if (endDate)
        queryBuilder.andWhere('driver_assigns.createdAt <= :endDate', {
          endDate: `${endDate} 23:59:59`,
        });
    }

    if (lastId && lastCreatedAt && lastId !== 'undefined') {
      queryBuilder.andWhere(
        '(driver_assigns.createdAt < :lastCreatedAt OR (driver_assigns.createdAt = :lastCreatedAt AND driver_assigns.id < :lastId))',
        { lastCreatedAt, lastId },
      );
    } else {
      const skip = (page - 1) * limit;
      queryBuilder.skip(skip);
    }

    const rawData = await queryBuilder
      .orderBy('driver_assigns.createdAt', 'DESC')
      .addOrderBy('driver_assigns.id', 'DESC')
      .take(limit)
      .getMany();
    const data = rawData.map((assign) => ({
      id: assign.id,

      driver_id: assign.driver?.id || null,
      driver_name: assign.driver?.driver_name || null,

      vehicle_id: assign.vehicle?.id || null,
      vehicle_name: assign.vehicle?.vehicle_name || null,

      station_id: assign.station?.id || null,
      station_name: assign.station?.station_name || null,
    }));

    const hasFilters = !!(
      search ||
      startDate ||
      endDate ||
      driver_id ||
      vehicle_id
    );
    const total = await this.getOptimizedCount(queryBuilder, hasFilters);

    return {
      data,
      total,
      totalPages: Math.ceil(total / limit) || 1,
      currentPage: page,
    };
  }

  private async getOptimizedCount(
    queryBuilder: SelectQueryBuilder<VehicleDriverAssign>,
    hasFilters: boolean,
  ): Promise<number> {
    if (hasFilters) {
      return await queryBuilder.getCount();
    }

    try {
      const result = await this.vehicleDriverAssignRepo.query<
        { estimate: string }[]
      >(
        `SELECT reltuples::bigint AS estimate FROM pg_class c 
             JOIN pg_namespace n ON n.oid = c.relnamespace 
             WHERE n.nspname = 'master_vehicle' AND c.relname = 'driver_assigns'`, // Schema name ကို သတိထားပါ
      );

      const estimate = result?.[0]?.estimate ? Number(result[0].estimate) : 0;
      return estimate < 1000
        ? await this.vehicleDriverAssignRepo.count()
        : estimate;
    } catch {
      return await this.vehicleDriverAssignRepo.count();
    }
  }
}
