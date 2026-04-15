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

      if (driver.status === 'Busy' || vehicle.status === 'Busy') {
        throw new ConflictException('Driver or Vehicle is already Busy');
      }

      await queryRunner.manager.update(
        VehicleDriverAssign,
        { vehicle_id: dto.vehicle_id, status: 'Active' },
        { status: 'Inactive', returned_at: new Date() },
      );

      const validStationId = dto.station_id || driver.station_id || null;

      // 🛑 TS 2769 Error ရှင်းရန်: create ထဲတွင် station ကို တိုက်ရိုက်မထည့်ပါ
      const newAssign = queryRunner.manager.create(VehicleDriverAssign, {
        ...dto,
        assigned_at: dto.assigned_at || new Date(),
        status: 'Ongoing',
      });

      // 🛑 validStationId ရှိမှသာ (any မသုံးဘဲ) အသစ်ထည့်ပါသည်
      if (validStationId) {
        newAssign.station = { id: validStationId } as typeof newAssign.station;
      }

      await queryRunner.manager.update(Vehicle, vehicle.id, { status: 'Busy' });
      await queryRunner.manager.update(Driver, driver.id, { status: 'Busy' });

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
        'drivers.image',
        'drivers.nrc',
        'drivers.license_type',
        'drivers.license_no',
        'drivers.phone',
        'vehicles.id',
        'vehicles.vehicle_name',
        'vehicles.image',
        'vehicles.license_plate',
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
      driver_image: assign.driver?.image ?? null,
      driver_nrc: assign.driver?.nrc ?? null,
      driver_license_type: assign.driver?.license_type ?? null,
      driver_license: assign.driver?.license_no ?? null,
      phone: assign.driver?.phone ?? null,
      vehicle_id: assign.vehicle?.id ?? null,
      vehicle_name: assign.vehicle?.vehicle_name ?? null,
      vehicle_image: assign.vehicle?.image ?? null,
      vehicle_license: assign.vehicle?.license_plate ?? null,
      station_id: assign.station?.id ?? null,
      station_name: assign.station?.station_name ?? null,
      createdAt: assign.createdAt,
      status: assign.status,
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
      // 🛑 ESLint (no-unsafe-assignment, no-unsafe-member-access) ရှင်းရန်: Result ကို unknown ဖြင့်ဖမ်းပြီး သေချာစစ်ဆေးပါသည်
      const result: unknown = await this.vehicleDriverAssignRepo.query(
        `SELECT reltuples::bigint AS estimate FROM pg_class c 
         JOIN pg_namespace n ON n.oid = c.relnamespace 
         WHERE n.nspname = 'master_vehicle' AND c.relname = 'driver_assigns'`,
      );

      let estimate = 0;

      if (Array.isArray(result) && result.length > 0) {
        const firstRow = result[0] as Record<string, unknown>;
        if (
          firstRow &&
          typeof firstRow === 'object' &&
          'estimate' in firstRow
        ) {
          estimate = Number(firstRow.estimate);
        }
      }

      return estimate < 1000 ? this.vehicleDriverAssignRepo.count() : estimate;
    } catch {
      return this.vehicleDriverAssignRepo.count();
    }
  }

  async findOne(id: string) {
    const assign = await this.vehicleDriverAssignRepo.findOne({
      where: { id },
      relations: { vehicle: true, driver: true, station: true },
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
        relations: { vehicle: true, driver: true, station: true },
      });

      if (!assign) throw new NotFoundException(`Assignment not found`);

      if (dto.vehicle_id && dto.vehicle_id !== assign.vehicle?.id) {
        const newVehicle = await queryRunner.manager.findOneBy(Vehicle, {
          id: dto.vehicle_id,
        });

        if (!newVehicle) throw new NotFoundException(`New vehicle not found`);
        if (newVehicle.status === 'Busy') {
          throw new ConflictException('New vehicle is already assigned/Busy');
        }

        if (assign.vehicle?.id) {
          await queryRunner.manager.update(Vehicle, assign.vehicle.id, {
            status: 'Active',
          });
        }
        await queryRunner.manager.update(Vehicle, newVehicle.id, {
          status: 'Busy',
        });

        assign.vehicle = newVehicle;
      }

      if (dto.driver_id && dto.driver_id !== assign.driver?.id) {
        const newDriver = await queryRunner.manager.findOneBy(Driver, {
          id: dto.driver_id,
        });

        if (!newDriver) throw new NotFoundException(`New driver not found`);
        if (newDriver.status === 'Busy') {
          throw new ConflictException('New driver is already assigned/Busy');
        }

        if (assign.driver?.id) {
          await queryRunner.manager.update(Driver, assign.driver.id, {
            status: 'Active',
          });
        }
        await queryRunner.manager.update(Driver, newDriver.id, {
          status: 'Busy',
        });

        assign.driver = newDriver;
      }

      if (dto.status === 'Inactive' && assign.status === 'Active') {
        if (assign.vehicle?.id) {
          await queryRunner.manager.update(Vehicle, assign.vehicle.id, {
            status: 'Active',
          });
        }
        if (assign.driver?.id) {
          await queryRunner.manager.update(Driver, assign.driver.id, {
            status: 'Active',
          });
        }
      }

      Object.assign(assign, dto);

      if (dto.station_id !== undefined) {
        const updatedStationId = dto.station_id || null;
        assign.station = (
          updatedStationId ? { id: updatedStationId } : null
        ) as typeof assign.station;
      }

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
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const assign = await queryRunner.manager.findOne(VehicleDriverAssign, {
        where: { id },
        relations: ['vehicle', 'driver'],
      });

      if (!assign) throw new NotFoundException(`Assignment not found`);

      if (assign.vehicle?.id) {
        await queryRunner.manager.update(Vehicle, assign.vehicle.id, {
          status: 'Active',
        });
      }
      if (assign.driver?.id) {
        await queryRunner.manager.update(Driver, assign.driver.id, {
          status: 'Active',
        });
      }

      await queryRunner.manager.delete(VehicleDriverAssign, id);

      await queryRunner.commitTransaction();
      return { success: true, id };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async completeAssignment(id: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const assign = await queryRunner.manager.findOne(VehicleDriverAssign, {
        where: { id },
        relations: { vehicle: true, driver: true },
      });

      if (!assign) throw new NotFoundException(`Assignment not found`);

      if (assign.status === 'Completed') {
        throw new ConflictException('Assignment is already completed');
      }

      await queryRunner.manager.update(VehicleDriverAssign, id, {
        returned_at: new Date(),
        status: 'Completed',
      });

      if (assign.vehicle?.id) {
        await queryRunner.manager.update(Vehicle, assign.vehicle.id, {
          status: 'Active',
        });
      }

      if (assign.driver?.id) {
        await queryRunner.manager.update(Driver, assign.driver.id, {
          status: 'Active',
        });
      }

      await queryRunner.commitTransaction();
      return { message: 'Trip completed successfully' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
