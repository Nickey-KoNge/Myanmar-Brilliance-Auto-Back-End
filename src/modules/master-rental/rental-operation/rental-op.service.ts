import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, In } from 'typeorm';
import { RentalOperation } from './entities/rental-operation.entity';
import { CreateRentalOperationDto } from './dtos/create-rental-operation.dto';
import { UpdateRentalOperationDto } from './dtos/update-rental-operation.dto';
import { OpService } from '../../../common/service/op.service';
import { PaginateRentalOperationDto } from './dtos/paginate-rental-operation.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { MasterAuditService } from 'src/modules/master-audit/audit/audit.service';
import { getChanges } from '../../../common/utils/object.util';
import { VehicleDriverAssign } from 'src/modules/master-vehicle/driver-assign/entities/vehicle-driver-assign.entity';
import { GenerateOpsByStationDto } from './dtos/generate-ops.dto';

@Injectable()
export class RentalOpService {
  constructor(
    private readonly opService: OpService,

    @InjectRepository(RentalOperation)
    private readonly rentalOpRepo: Repository<RentalOperation>,
    private readonly auditService: MasterAuditService,
    @InjectRepository(VehicleDriverAssign)
    private readonly driverAssignRepo: Repository<VehicleDriverAssign>,
  ) {}

  async create(
    dto: CreateRentalOperationDto,
    userId: string,
  ): Promise<RentalOperation> {
    const newOpPayload = {
      ...dto,
      route: { id: dto.route_id },
      vehicle: { id: dto.vehicle_id },
      driver: { id: dto.driver_id },
      station: { id: dto.station_id },
    };

    const newRentalOp = this.rentalOpRepo.create(newOpPayload);
    const savedOp = await this.rentalOpRepo.save(newRentalOp);

    await this.auditService.logAction(
      'rental_operation',
      savedOp.id,
      'CREATE',
      null,
      { ...dto },
      userId,
    );

    return savedOp;
  }

  async findAll(query: PaginateRentalOperationDto) {
    const {
      page = 1,
      limit = 10,
      search,
      lastId,
      lastCreatedAt,
      route_id,
      vehicle_id,
      driver_id,
      station_id,
      trip_status,
      status,
      startDate,
      endDate,
    } = query;

    const skip = (Number(page) - 1) * Number(limit);

    const queryBuilder = this.rentalOpRepo
      .createQueryBuilder('rental_operation')
      .leftJoinAndSelect('rental_operation.route', 'route')
      .leftJoinAndSelect('rental_operation.vehicle', 'vehicle')
      .leftJoinAndSelect('rental_operation.driver', 'driver')
      .leftJoinAndSelect('rental_operation.station', 'station')
      .leftJoinAndSelect('station.branch', 'branch');

    if (search) {
      queryBuilder.andWhere(
        '(rental_operation.description ILIKE :search OR route.route_name ILIKE :search OR driver.driver_name ILIKE :search OR vehicle.vehicle_name ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (route_id) {
      queryBuilder.andWhere('rental_operation.route_id = :route_id', {
        route_id,
      });
    }
    if (vehicle_id) {
      queryBuilder.andWhere('rental_operation.vehicle_id = :vehicle_id', {
        vehicle_id,
      });
    }
    if (driver_id) {
      queryBuilder.andWhere('rental_operation.driver_id = :driver_id', {
        driver_id,
      });
    }
    if (station_id) {
      queryBuilder.andWhere('rental_operation.station_id = :station_id', {
        station_id,
      });
    }
    if (trip_status) {
      queryBuilder.andWhere('rental_operation.trip_status = :trip_status', {
        trip_status,
      });
    }
    if (status) {
      queryBuilder.andWhere('rental_operation.status = :status', { status });
    }

    if (startDate || endDate) {
      if (startDate) {
        queryBuilder.andWhere('rental_operation.created_at >= :startDate', {
          startDate: `${startDate} 00:00:00`,
        });
      }
      if (endDate) {
        queryBuilder.andWhere('rental_operation.created_at <= :endDate', {
          endDate: `${endDate} 23:59:59`,
        });
      }
    }

    if (lastId && lastCreatedAt && lastId !== 'undefined') {
      queryBuilder.andWhere(
        '(rental_operation.created_at < :lastCreatedAt OR (rental_operation.created_at = :lastCreatedAt AND rental_operation.id < :lastId))',
        { lastCreatedAt, lastId },
      );
    } else {
      queryBuilder.skip(skip);
    }

    queryBuilder
      .take(Number(limit))
      .orderBy('rental_operation.created_at', 'DESC');

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      items,
      meta: {
        totalItems: total,
        itemCount: items.length,
        itemsPerPage: Number(limit),
        totalPages: Math.ceil(total / Number(limit)) || 1,
        currentPage: Number(page),
      },
    };
  }

  async findOne(id: string): Promise<RentalOperation> {
    const op = await this.rentalOpRepo.findOne({
      where: { id } as FindOptionsWhere<RentalOperation>,
      relations: ['route', 'vehicle', 'driver', 'station', 'station.branch'],
    });

    if (!op) {
      throw new NotFoundException(`Rental Operation with ID ${id} not found`);
    }

    return op;
  }

  async update(
    id: string,
    dto: UpdateRentalOperationDto,
    userId: string,
  ): Promise<RentalOperation> {
    const existingOp = await this.findOne(id);

    const oldState = { ...existingOp };
    const updatePayload = { ...dto } as Partial<RentalOperation>;

    // Handle Scalar ID updates
    if (dto.route_id) updatePayload.route_id = dto.route_id;
    if (dto.vehicle_id) updatePayload.vehicle_id = dto.vehicle_id;
    if (dto.driver_id) updatePayload.driver_id = dto.driver_id;
    if (dto.station_id) updatePayload.station_id = dto.station_id;

    if (Object.keys(updatePayload).length > 0) {
      await this.rentalOpRepo.update(id, updatePayload);
    }

    const updatedOp = await this.findOne(id);

    const cleanOldState = JSON.parse(JSON.stringify(oldState)) as Record<
      string,
      unknown
    >;
    const cleanNewState = JSON.parse(JSON.stringify(dto)) as Record<
      string,
      unknown
    >;

    const { oldVals, newVals } = getChanges(cleanOldState, cleanNewState);

    if (Object.keys(newVals).length > 0) {
      await this.auditService.logAction(
        'rental_operation',
        id,
        'UPDATE',
        oldVals,
        newVals,
        userId,
      );
    }

    return updatedOp;
  }

  async remove(id: string, userId: string): Promise<{ id: string }> {
    const opToDelete = await this.findOne(id);
    const oldState = { ...opToDelete };

    await this.rentalOpRepo.remove(opToDelete);

    const cleanOldState = JSON.parse(JSON.stringify(oldState)) as Record<
      string,
      unknown
    >;

    await this.auditService.logAction(
      'rental_operation',
      id,
      'DELETE',
      cleanOldState,
      null,
      userId,
    );

    return { id };
  }

  async restoreRentalOperation(
    auditId: string,
    userId: string,
  ): Promise<RentalOperation> {
    const auditRecord = await this.auditService.findOne(auditId);

    if (auditRecord.entity_name !== 'rental_operation') {
      throw new Error('Invalid audit record for rental operation restoration');
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

    const relationKeys = ['route', 'vehicle', 'driver', 'station'];
    for (const key of relationKeys) {
      if (
        safeDataToRestore[key] &&
        typeof safeDataToRestore[key] === 'object'
      ) {
        const relationObj = safeDataToRestore[key] as Record<string, unknown>;
        if (relationObj.id) {
          safeDataToRestore[`${key}_id`] = relationObj.id;
        }
        delete safeDataToRestore[key];
      }
    }

    const existingOp = await this.rentalOpRepo.findOne({
      where: { id: auditRecord.entity_id } as FindOptionsWhere<RentalOperation>,
      withDeleted: true,
    });

    let restored: RentalOperation;

    const toPlainObject = (data: unknown): Record<string, unknown> => {
      return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
    };

    const beforeState =
      existingOp != null
        ? toPlainObject(existingOp)
        : { status: 'Permanently Deleted / Not Exists' };

    if (existingOp) {
      Object.assign(existingOp, safeDataToRestore);

      const opWithSoftDelete = existingOp as RentalOperation & {
        deletedAt?: Date | null;
        deleted_at?: Date | null;
      };

      if (opWithSoftDelete.deletedAt || opWithSoftDelete.deleted_at) {
        opWithSoftDelete.deletedAt = null;
        opWithSoftDelete.deleted_at = null;
      }

      // 🛑 TypeORM တွင် Scalar ID ပြောင်းလဲပါက Relation Object ကိုပါ ထည့်ပေးရပါမည်
      if (safeDataToRestore['route_id']) {
        existingOp.route = {
          id: safeDataToRestore['route_id'],
        } as typeof existingOp.route;
      }
      if (safeDataToRestore['vehicle_id']) {
        existingOp.vehicle = {
          id: safeDataToRestore['vehicle_id'],
        } as typeof existingOp.vehicle;
      }
      if (safeDataToRestore['driver_id']) {
        existingOp.driver = {
          id: safeDataToRestore['driver_id'],
        } as typeof existingOp.driver;
      }
      if (safeDataToRestore['station_id']) {
        existingOp.station = {
          id: safeDataToRestore['station_id'],
        } as typeof existingOp.station;
      }

      restored = await this.rentalOpRepo.save(existingOp);
    } else {
      const newOp = this.rentalOpRepo.create(safeDataToRestore);
      Object.assign(newOp, { id: auditRecord.entity_id });

      if (safeDataToRestore['route_id']) {
        newOp.route = {
          id: safeDataToRestore['route_id'],
        } as typeof newOp.route;
      }
      if (safeDataToRestore['vehicle_id']) {
        newOp.vehicle = {
          id: safeDataToRestore['vehicle_id'],
        } as typeof newOp.vehicle;
      }
      if (safeDataToRestore['driver_id']) {
        newOp.driver = {
          id: safeDataToRestore['driver_id'],
        } as typeof newOp.driver;
      }
      if (safeDataToRestore['station_id']) {
        newOp.station = {
          id: safeDataToRestore['station_id'],
        } as typeof newOp.station;
      }

      restored = await this.rentalOpRepo.save(newOp);
    }

    const afterState = {
      id: restored.id,
      ...safeDataToRestore,
    };

    await this.auditService.logAction(
      'rental_operation',
      restored.id,
      'RESTORE',
      beforeState,
      afterState,
      userId,
    );

    return restored;
  }

  //get driver and vehcile assignment by station and route
  async generateOpsByStationAndRoute(
    dto: GenerateOpsByStationDto,
    userId: string,
  ) {
    const { station_id, route_id } = dto;
    const activeAssignments = await this.driverAssignRepo.find({
      where: {
        station: { id: station_id },
        status: In(['Ongoing']),
      },
      relations: ['vehicle', 'driver'],
    });

    if (activeAssignments.length === 0) {
      throw new NotFoundException(
        `No active driver-vehicle assignments found for station ID ${station_id} and route ID ${route_id}`,
      );
    }
    const createdOps: RentalOperation[] = [];

    for (const assign of activeAssignments) {
      const newOpPayload = this.rentalOpRepo.create({
        station_id: station_id,
        route_id: route_id,
        vehicle_id: assign.vehicle_id,
        driver_id: assign.driver_id,
        trip_status: 'Pending',
        status: 'Active',
        start_time: new Date(),
      });
      createdOps.push(newOpPayload);
    }

    // save data on db
    const savedOps = await this.rentalOpRepo.save(createdOps);

    for (const op of savedOps) {
      await this.auditService.logAction(
        'rental_operation',
        op.id,
        'CREATE',
        null,
        { ...op },
        userId,
      );
    }

    // front end data return format
    return await this.rentalOpRepo.find({
      where: { id: In(savedOps.map((op) => op.id)) },
      relations: [
        'vehicle',
        'driver',
        'station',
        'route',
        'vehicle.vehicle_model',
        'vehicle.vehicle_model.vehicle_brand',
        'station.branch',
      ],
    });
  }
}
