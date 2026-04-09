import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { Driver } from 'src/modules/master-company/driver/entities/driver.entity';
import { Vehicle } from '../vehicle/entities/vehicle.entity';
import { VehicleDriverAssign } from './entities/vehicle-driver-assign.entity';
import { CreateVehicleDriverAssignDto } from './dtos/create-vehicle-driver-assign.dto';
import { PaginateVehicleDriverAssignDto } from './dtos/paginate-vehicle-driver-assign.dto';
import { UpdateVehicleDriverDto } from './dtos/update-vehicle-driver-assign.dto';

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

      // Deactivate any existing active assignment for this vehicle
      await queryRunner.manager.update(
        VehicleDriverAssign,
        { vehicle_id: dto.vehicle_id, status: 'Active' },
        { status: 'Inactive', returned_at: new Date() },
      );

      const newAssign = queryRunner.manager.create(VehicleDriverAssign, {
        ...dto,
        assigned_at: dto.assigned_at || new Date(),
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
      lastCreatedAt,
      startDate,
      endDate,
    } = query;

    const queryBuilder = this.vehicleDriverAssignRepo
      .createQueryBuilder('driver_assigns')
      .leftJoinAndSelect('driver_assigns.driver', 'drivers')
      .leftJoinAndSelect('driver_assigns.vehicle', 'vehicles')
      .leftJoinAndSelect('driver_assigns.station', 'stations')
      .select([
        'driver_assigns',
        'drivers.id',
        'drivers.driver_name',
        'vehicles.id',
        'vehicles.vehicle_name',
        'stations.id',
        'stations.station_name',
      ]);

    if (driver_id) {
      queryBuilder.andWhere('driver_assigns.driver_id = :driver_id', {
        driver_id,
      });
    }

    if (vehicle_id) {
      queryBuilder.andWhere('driver_assigns.vehicle_id = :vehicle_id', {
        vehicle_id,
      });
    }

    if (station_id) {
      queryBuilder.andWhere('driver_assigns.station_id = :station_id', {
        station_id,
      });
    }

    if (search) {
      queryBuilder.andWhere(
        '(drivers.driver_name ILike :search OR vehicles.vehicle_name ILike :search)',
        { search: `%${search}%` },
      );
    }

    if (startDate) {
      queryBuilder.andWhere('driver_assigns.createdAt >= :startDate', {
        startDate: `${startDate} 00:00:00`,
      });
    }

    if (endDate) {
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
      queryBuilder.skip((page - 1) * limit);
    }

    const [rawData, total] = await Promise.all([
      queryBuilder
        .orderBy('driver_assigns.createdAt', 'DESC')
        .addOrderBy('driver_assigns.id', 'DESC')
        .take(limit)
        .getMany(),
      this.getOptimizedCount(
        queryBuilder,
        !!(search || startDate || endDate || driver_id || vehicle_id),
      ),
    ]);

    const data = rawData.map((assign) => ({
      id: assign.id,
      driver_id: assign.driver?.id ?? null,
      driver_name: assign.driver?.driver_name ?? null,
      vehicle_id: assign.vehicle?.id ?? null,
      vehicle_name: assign.vehicle?.vehicle_name ?? null,
      station_id: assign.station?.id ?? null,
      station_name: assign.station?.station_name ?? null,
    }));

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
    if (hasFilters) return queryBuilder.getCount();

    try {
      const result = await this.vehicleDriverAssignRepo.query(
        `SELECT reltuples::bigint AS estimate FROM pg_class c 
         JOIN pg_namespace n ON n.oid = c.relnamespace 
         WHERE n.nspname = 'master_vehicle' AND c.relname = 'driver_assigns'`,
      );

      const estimate = Number(result?.[0]?.estimate ?? 0);
      return estimate < 1000 ? this.vehicleDriverAssignRepo.count() : estimate;
    } catch {
      return this.vehicleDriverAssignRepo.count();
    }
  }

  async findOne(id: string) {
    const assign = await this.vehicleDriverAssignRepo.findOne({
      where: { id },
      relations: { vehicle: true, driver: true },
    });

    if (!assign) throw new NotFoundException(`Assignment not found`);
    return assign;
  }

  async update(id: string, dto: UpdateVehicleDriverDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const assign = await queryRunner.manager.findOne(VehicleDriverAssign, {
        where: { id },
        relations: { vehicle: true, driver: true },
      });

      if (!assign) throw new NotFoundException(`Assignment not found`);

      if (dto.vehicle_id && dto.vehicle_id !== assign.vehicle_id) {
        const vehicle = await queryRunner.manager.findOneBy(Vehicle, {
          id: dto.vehicle_id,
        });
        if (!vehicle) throw new NotFoundException(`New vehicle not found`);

        const isBusy = await queryRunner.manager.findOneBy(
          VehicleDriverAssign,
          {
            vehicle_id: dto.vehicle_id,
            status: 'Active',
          },
        );
        if (isBusy)
          throw new ConflictException('New vehicle is already assigned');

        assign.vehicle = vehicle;
      }

      if (dto.driver_id && dto.driver_id !== assign.driver_id) {
        const driver = await queryRunner.manager.findOneBy(Driver, {
          id: dto.driver_id,
        });
        if (!driver) throw new NotFoundException(`New driver not found`);

        const isBusy = await queryRunner.manager.findOneBy(
          VehicleDriverAssign,
          {
            driver_id: dto.driver_id,
            status: 'Active',
          },
        );
        if (isBusy)
          throw new ConflictException('New driver is already assigned');

        assign.driver = driver;
      }

      Object.assign(assign, dto);
      const updated = await queryRunner.manager.save(assign);

      await queryRunner.commitTransaction();
      return updated;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string) {
    const result = await this.vehicleDriverAssignRepo.delete(id);
    if (result.affected === 0)
      throw new NotFoundException(`Assignment not found`);
    return { success: true, id };
  }
}
