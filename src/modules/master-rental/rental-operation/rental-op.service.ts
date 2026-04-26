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
import { Cron, CronExpression } from '@nestjs/schedule';
import { TripFinanceService } from '../trip-finance/trip-finance.service';
import { TripPrice } from '../../master-trips/trip-price/entities/trip-price.entity';

// interface ExpectedVehicleData {
//   vehicle_model_id?: string;
//   vehicle_model?: { id: string };
//   vehicleModel?: { id: string };
// }
@Injectable()
export class RentalOpService {
  constructor(
    private readonly opService: OpService,

    @InjectRepository(RentalOperation)
    private readonly rentalOpRepo: Repository<RentalOperation>,
    private readonly auditService: MasterAuditService,
    @InjectRepository(VehicleDriverAssign)
    private readonly driverAssignRepo: Repository<VehicleDriverAssign>,

    private readonly tripFinanceService: TripFinanceService,
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
      trip_finance_id,
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
      .leftJoinAndSelect('station.branch', 'branch')
      .leftJoinAndSelect('rental_operation.trip_finances', 'trip_finance');

    if (trip_finance_id) {
      queryBuilder.andWhere(
        'rental_operation.trip_finance_id = :trip_finance_id',
        {
          trip_finance_id,
        },
      );
    }

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

  // async update(
  //   id: string,
  //   dto: UpdateRentalOperationDto,
  //   userId: string,
  //   ID: string,
  // ): Promise<RentalOperation> {
  //   const existingOp = await this.rentalOpRepo.findOne({
  //     where: { id },
  //     relations: ['vehicle', 'vehicle.vehicle_model', 'route'],
  //   });
  //   if (!existingOp) throw new NotFoundException('Rental Operation not found');

  //   if (
  //     dto.trip_status === 'Completed' &&
  //     existingOp.trip_status !== 'Completed'
  //   ) {
  //     try {
  //       console.log('Finalizing Trip... Creating Finance Record for:', id);

  //       // --- ၁။ Rental Amount သတ်မှတ်ခြင်း ---
  //       const isCityTrip = existingOp.route?.route_name
  //         ?.toLowerCase()
  //         .includes('city');
  //       const vModel = existingOp.vehicle?.vehicle_model;

  //       const baseRate = isCityTrip
  //         ? Number(vModel?.daily_trip_rate || 0)
  //         : Number(vModel?.overnight_trip_rate || 0);

  //       let overtimeAmount = 0;
  //       const start = new Date(existingOp.start_time);
  //       const end = new Date(dto.end_time || new Date());

  //       const diffMs = end.getTime() - start.getTime();
  //       const diffMins = Math.floor(diffMs / (1000 * 60)); // စုစုပေါင်းကြာချိန် (မိနစ်)

  //       // Benchmark hours (City ဆို 12 နာရီ၊ နယ်ဆို 24 နာရီ စသဖြင့် သတ်မှတ်နိုင်သည်)
  //       const benchmarkMins = isCityTrip ? 12 * 60 : 24 * 60;

  //       if (diffMins > benchmarkMins) {
  //         const extraMins = diffMins - benchmarkMins;
  //         const ratePerHour = baseRate / (isCityTrip ? 12 : 24);
  //         const ratePerMin = ratePerHour / 60;
  //         overtimeAmount = Math.round(extraMins * ratePerMin);
  //       }

  //       // --- ၃။ Total တွက်ချက်ခြင်း ---
  //       const refundAmount = Number(dto.amount || 0); // dto.amount ကို refund အဖြစ်ယူလျှင်
  //       const total = baseRate + overtimeAmount - refundAmount;

  //       console.log(
  //         `Finalizing Trip: Base=${baseRate}, OT=${overtimeAmount}, Refund=${refundAmount}, Total=${total}`,
  //       );

  //       await this.tripFinanceService.create({
  //         trip_id: id,
  //         staff_id: ID,
  //         rental_amount: String(baseRate),
  //         overtime_amount: String(overtimeAmount),
  //         refund_amount: String(refundAmount),
  //         total: String(total),
  //         payment_status: 'Pending',
  //         status: 'Active',
  //       });

  //       console.log('TripFinance Created Successfully for Finalize');
  //     } catch (finError) {
  //       console.error('Failed to create Finance during Finalize:', finError);
  //     }
  //   }

  //   const oldState = { ...existingOp };
  //   const updatePayload = { ...dto } as Partial<RentalOperation>;

  //   // Handle Scalar ID updates
  //   if (dto.route_id) updatePayload.route_id = dto.route_id;
  //   if (dto.vehicle_id) updatePayload.vehicle_id = dto.vehicle_id;
  //   if (dto.driver_id) updatePayload.driver_id = dto.driver_id;
  //   if (dto.station_id) updatePayload.station_id = dto.station_id;

  //   if (Object.keys(updatePayload).length > 0) {
  //     await this.rentalOpRepo.update(id, updatePayload);
  //   }

  //   const updatedOp = await this.findOne(id);

  //   const cleanOldState = JSON.parse(JSON.stringify(oldState)) as Record<
  //     string,
  //     unknown
  //   >;
  //   const cleanNewState = JSON.parse(JSON.stringify(dto)) as Record<
  //     string,
  //     unknown
  //   >;

  //   const { oldVals, newVals } = getChanges(cleanOldState, cleanNewState);

  //   if (Object.keys(newVals).length > 0) {
  //     await this.auditService.logAction(
  //       'rental_operation',
  //       id,
  //       'UPDATE',
  //       oldVals,
  //       newVals,
  //       userId,
  //     );
  //   }

  //   return updatedOp;
  // }
  async update(
    id: string,
    dto: UpdateRentalOperationDto,
    userId: string,
    ID: string,
  ): Promise<RentalOperation> {
    const existingOp = await this.rentalOpRepo.findOne({
      where: { id },
      relations: ['vehicle', 'route'],
    });

    if (!existingOp) throw new NotFoundException('Rental Operation not found');

    if (
      dto.trip_status === 'Completed' &&
      existingOp.trip_status !== 'Completed'
    ) {
      try {
        console.log('Finalizing Trip... Creating Finance Record for:', id);

        const routeName = existingOp.route?.route_name || 'Unknown Route';
        const isCityTrip = routeName.toLowerCase().includes('city');
        const routeId = existingOp.route_id;

        // 🔍 Terminal တွင် ဘယ် ID ဖြင့်ရှာနေလဲ ကြည့်ရန်
        console.log('--- 🔍 DEBUG: IDs for Trip Price Search ---');
        console.log(
          `Route ID: ${routeId} (Name: ${routeName}, isCity: ${isCityTrip})`,
        );

        let matchedTripPrice: TripPrice | null = null;

        // 🛑 ပြင်ဆင်ချက်: vehicle_model_id ရှာသည့်ရှုပ်ထွေးသော Raw Query ကိုဖြုတ်ပြီး route_id ဖြင့်သာ တိုက်ရိုက်ရှာပါမည်
        if (routeId) {
          matchedTripPrice = await this.rentalOpRepo.manager.findOne(
            TripPrice,
            {
              where: {
                route_id: routeId,
              },
            },
          );
        }

        if (!matchedTripPrice) {
          console.error(
            '❌ ERROR: No matching row in trip_prices table for this Route ID!',
          );
        } else {
          console.log(
            `✅ Found Price -> Daily: ${matchedTripPrice.daily_trip_rate}, Overnight: ${matchedTripPrice.overnight_trip_rate}`,
          );
        }

        // --- ၁။ Rental Amount (Base Rate) တွက်ချက်ခြင်း ---
        const baseRate = isCityTrip
          ? Number(matchedTripPrice?.daily_trip_rate || 0)
          : Number(matchedTripPrice?.overnight_trip_rate || 0);

        // --- ၂။ Overtime တွက်ချက်ခြင်း ---
        let overtimeAmount = 0;
        const start = new Date(existingOp.start_time || new Date());
        const end = new Date(dto.end_time || new Date());

        const diffMs = end.getTime() - start.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60)); // မိနစ်

        const benchmarkMins = isCityTrip ? 12 * 60 : 24 * 60;

        if (diffMins > benchmarkMins && baseRate > 0) {
          const extraMins = diffMins - benchmarkMins;
          const ratePerHour = baseRate / (isCityTrip ? 12 : 24);
          const ratePerMin = ratePerHour / 60;
          overtimeAmount = Math.round(extraMins * ratePerMin);
        }

        // --- ၃။ Total တွက်ချက်ခြင်း ---
        const refundAmount = Number(dto.amount || 0);
        const total = baseRate + overtimeAmount - refundAmount;

        console.log(
          `✅ Finalizing Trip Result: Base=${baseRate}, OT=${overtimeAmount}, Refund=${refundAmount}, Total=${total}`,
        );

        await this.tripFinanceService.create({
          trip_id: id,
          staff_id: ID,
          rental_amount: String(baseRate),
          overtime_amount: String(overtimeAmount),
          refund_amount: String(refundAmount),
          total: String(total),
          payment_status: 'Pending',
          status: 'Active',
        });
      } catch (finError) {
        console.error('Failed to create Finance during Finalize:', finError);
      }
    }

    // --- ပုံမှန် Update Logic ---
    const oldState = { ...existingOp };
    const updatePayload = { ...dto } as Partial<RentalOperation>;

    if (dto.route_id) updatePayload.route_id = dto.route_id;
    if (dto.vehicle_id) updatePayload.vehicle_id = dto.vehicle_id;
    if (dto.driver_id) updatePayload.driver_id = dto.driver_id;
    if (dto.station_id) updatePayload.station_id = dto.station_id;

    if (Object.keys(updatePayload).length > 0) {
      await this.rentalOpRepo.update(id, updatePayload);
    }

    const updatedOp = await this.findOne(id);

    // Any မပါစေရန် Record<string, unknown> ကို သုံးထားသည်
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
  async generateOpsByStationAndRoute(
    dto: GenerateOpsByStationDto,
    userId: string,
    ID: string,
  ) {
    console.log('Dto value :', dto);
    console.log('userId Value :', userId);
    console.log('ID value:', ID);
    const { station_id, route_id } = dto;
    const activeAssignments = await this.driverAssignRepo.find({
      where: { station: { id: station_id }, status: In(['Ongoing']) },
      relations: ['vehicle', 'driver'],
    });
    if (activeAssignments.length === 0) return [];
    // ၁။ Rental Operations အရင်သိမ်းသည်
    const opsData = activeAssignments.map((assign) => ({
      station_id: station_id,
      route_id: route_id,
      vehicle_id: assign.vehicle_id,
      driver_id: assign.driver_id,
      trip_status: 'Pending',
      status: 'Active',
      start_time: new Date(),
    }));
    // repository.create ထဲကို အကုန်ထည့်ပါ
    const entities = this.rentalOpRepo.create(opsData);
    const savedOps = await this.rentalOpRepo.save(entities);
    console.log('Saved Ops Count:', savedOps.length);
    // ၂။ အကယ်၍ bulk generate လုပ်စဉ်မှာတင် Finance ပါ ဆောက်ချင်ရင်
    const financePromises = savedOps.map((op) =>
      this.tripFinanceService.create({
        trip_id: op.id,
        staff_id: ID,
        rental_amount: '0',
        overtime_amount: '0',
        refund_amount: '0',
        total: '0',
        payment_status: 'Pending',
        status: 'Active',
      }),
    );
    const savedFinances = await Promise.all(financePromises);
    console.log('Saved Finances Result:', savedFinances);
    // ၄။ Audit logs သွင်းခြင်း
    const auditPromises = [
      ...savedOps.map((op) =>
        this.auditService.logAction(
          'rental_operation',
          op.id,
          'CREATE',
          null,
          { ...op },
          userId,
        ),
      ),
      ...savedFinances.map((fin) =>
        this.auditService.logAction(
          'trip_finances',
          fin.id,
          'CREATE',
          null,
          { ...fin },
          userId,
        ),
      ),
    ];
    await Promise.all(auditPromises);
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
        'trip_finances',
      ],
    });
  }
  //auto update and re new form လုပ်ဖို ပါ ည၁၂ ထိုးတာနဲ့ လုပ်ပါမယ်
  @Cron(CronExpression.EVERY_30_MINUTES)
  async generateDailyCityTrips() {
    console.log('Running Auto-Dispatch Cron Job for City Trips at Midnight...');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
      const completedCityTrips = await this.rentalOpRepo
        .createQueryBuilder('op')
        .leftJoinAndSelect('op.route', 'route')
        .where('op.trip_status = :status', { status: 'Completed' })
        .andWhere('op.updated_at >= :today', { today })
        .andWhere('LOWER(route.route_name) LIKE :cityPattern', {
          cityPattern: '%city%',
        })
        .orderBy('op.updated_at', 'DESC')
        .getMany();

      if (completedCityTrips.length === 0) {
        console.log(
          'No completed City Trips found for today. Skipping next dispatch creation.',
        );
        return;
      }

      for (const op of completedCityTrips) {
        const existingPending = await this.rentalOpRepo.findOne({
          where: {
            vehicle_id: op.vehicle_id,
            trip_status: In(['Pending', 'Ongoing']),
            status: 'Active',
          },
        });

        if (!existingPending) {
          const newPendingOp = this.rentalOpRepo.create({
            station_id: op.station_id,
            route_id: op.route_id,
            vehicle_id: op.vehicle_id,
            driver_id: op.driver_id,
            start_odo: op.end_odo,
            start_battery: op.end_battery,
            trip_status: 'Pending',
            status: 'Active',
          });

          const savedOp = await this.rentalOpRepo.save(newPendingOp);

          await this.auditService.logAction(
            'rental_operation',
            savedOp.id,
            'CREATE',
            null,
            { ...savedOp },
            'System-Cron-Job',
          );
        }
      }

      console.log('Successfully created auto-dispatches for tomorrow.');
    } catch (error) {
      console.error('Error generating daily city trips from Cron:', error);
    }
  }
}
