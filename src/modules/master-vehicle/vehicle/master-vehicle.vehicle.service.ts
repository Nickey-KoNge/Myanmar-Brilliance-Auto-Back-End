// import { OpService } from 'src/common/service/op.service';
// import { Repository } from 'typeorm';
// import { Vehicle } from './entities/vehicle.entity';
// import { InjectRepository } from '@nestjs/typeorm';
// import { CreateVehicleDto } from './dtos/create-vehicle.dto';
// import { OptimizeImageService } from 'src/common/service/optimize-image.service';
// import { IFileService } from 'src/common/service/i-file.service';
// import { Inject } from '@nestjs/common';
// import { UpdateVehicleDto } from './dtos/update-vehicle.dto';

// import { NotFoundException } from '@nestjs/common';
// import { SelectQueryBuilder } from 'typeorm/browser';
// import { PaginateVehicleDto } from './dtos/paginate-vehicle.dto';
// import { MasterAuditService } from 'src/modules/master-audit/audit/audit.service';

// export class MasterVehicleService {
//   constructor(
//     @InjectRepository(Vehicle)
//     private readonly vehicleRespository: Repository<Vehicle>,

//     @Inject(IFileService)
//     private readonly fileService: IFileService,
//     private readonly optimizeImageService: OptimizeImageService,
//     private readonly opService: OpService,
//     private readonly auditService: MasterAuditService,
//   ) {}

//   async create(
//     dto: CreateVehicleDto,
//     userId: string,
//     file?: Express.Multer.File,
//   ): Promise<Vehicle> {
//     if (file) {
//       const optimizedFile = await this.optimizeImageService.optimizeImage(file);
//       const imageUrl = await this.fileService.uploadFile(
//         optimizedFile,
//         'vehicle',
//       );
//       dto.image = imageUrl;
//     }

//     const newVehicle = await this.opService.create<Vehicle>(
//       this.vehicleRespository,
//       dto,
//     );
//     await this.auditService.logAction(
//       'vehicle',
//       newVehicle.id,
//       'CREATE',
//       null,
//       { ...dto },
//       userId,
//     );
//     return newVehicle;
//   }

//   async findAll(query: PaginateVehicleDto) {
//     // return await this.vehicleRespository.find();
//     const {
//       page,
//       limit,
//       search,
//       lastId,
//       station_id: stations_id,
//       group_id: groups_id,
//       vehicle_model_id: vehicle_models_id,
//       supplier_id: suppliers_id,
//       status,
//       lastCreatedAt,
//       startDate,
//       endDate,
//     } = query;

//     const queryBuilder = this.vehicleRespository.createQueryBuilder('vehicles');
//     queryBuilder
//       .leftJoinAndSelect('vehicles.station', 'station')
//       .leftJoinAndSelect('vehicles.group', 'group')
//       .leftJoinAndSelect('vehicles.vehicle_model', 'vehicle_model');

//     queryBuilder.addSelect([
//       'station.id',
//       'station.station_name',
//       'group.id',
//       'group.group_name',
//       'vehicle_model.id',
//       'vehicle_model.vehicle_model_name',
//     ]);

//     if (stations_id) {
//       queryBuilder.andWhere('vehicles.station=:stations_id', { stations_id });
//     }

//     if (groups_id) {
//       queryBuilder.andWhere('vehicles.group=:groups_id', { groups_id });
//     }

//     if (vehicle_models_id) {
//       queryBuilder.andWhere('vehicles.vehicle_model=:vehicle_models_id', {
//         vehicle_models_id,
//       });
//     }

//     if (suppliers_id) {
//       queryBuilder.andWhere('vehicles.supplier_id=:suppliers_id', {
//         suppliers_id,
//       });
//     }

//     if (status) {
//       queryBuilder.andWhere('vehicles.status=:status', { status });
//     }

//     if (search) {
//       queryBuilder.andWhere(
//         `(vehicles.vehicle_name ILike :search
//                 OR vehicles.license_plate ILike :search
//                 OR vehicles.city_taxi_no ILike :search
//                 OR vehicles.serial_no ILike :search
//                 OR vehicles.vin_no ILike :search
//                 OR vehicles.engine_no ILike :search
//                 OR vehicles.color ILike :search
//                 OR vehicles.license_type ILike :search
//                 OR vehicles.current_odometer ILike :search
//                 OR CAST(vehicles.vehicle_license_exp AS TEXT) ILike :search
//                 OR CAST(vehicles.service_intervals AS TEXT) ILike :search
//                 OR CAST(vehicles.purchase_date AS TEXT) ILike :search)
//                 `,
//         { search: `%${search}%` },
//       );
//     }

//     if (startDate || endDate) {
//       if (startDate) {
//         queryBuilder.andWhere('vehicles.createdAt >= :startDate', {
//           startDate: `${startDate} 00:00:00`,
//         });
//       }
//       if (endDate) {
//         queryBuilder.andWhere('vehicles.createdAt <= :endDate', {
//           endDate: `${endDate} 23:59:59`,
//         });
//       }
//     }

//     if (lastId && lastCreatedAt && lastId !== 'undefined') {
//       queryBuilder.andWhere(
//         '(vehicles.createdAt < :lastCreatedAt OR (vehicles.createdAt = :lastCreatedAt AND vehicles.id < :lastId))',
//         { lastCreatedAt, lastId },
//       );
//     } else {
//       const skip = (page - 1) * limit;
//       queryBuilder.skip(skip);
//     }

//     const rawData = await queryBuilder
//       .orderBy('vehicles.createdAt', 'DESC')
//       .addOrderBy('vehicles.id', 'DESC')
//       .take(limit)
//       .getMany();

//     const data = rawData.map((vehicle) => ({
//       id: vehicle.id,
//       vehicle_name: vehicle.vehicle_name,
//       city_taxi_no: vehicle.city_taxi_no,
//       serial_no: vehicle.serial_no,
//       vin_no: vehicle.vin_no,
//       engine_no: vehicle.engine_no,
//       license_plate: vehicle.license_plate,
//       color: vehicle.color,
//       license_type: vehicle.license_type,
//       current_odometer: vehicle.current_odometer,
//       vehicle_license_exp: vehicle.vehicle_license_exp,
//       service_intervals: vehicle.service_intervals,
//       purchase_date: vehicle.purchase_date,
//       image: vehicle.image,
//       status: vehicle.status,
//       station_id: vehicle.station?.id || null,
//       station_name: vehicle.station?.station_name || null,
//       group_id: vehicle.group?.id || null,
//       group_name: vehicle.group?.group_name || null,
//       vehicle_model_id: vehicle.vehicle_model?.id || null,
//       vehicle_model_name: vehicle.vehicle_model?.vehicle_model_name || null,
//       supplier_id: vehicle.supplier_id || null,
//     }));

//     const hasFilters = Boolean(
//       search ||
//       stations_id ||
//       groups_id ||
//       vehicle_models_id ||
//       suppliers_id ||
//       startDate ||
//       endDate,
//     );
//     const total = await this.getOptimizedCount(queryBuilder, hasFilters);

//     return {
//       data,
//       total,
//       totalPages: Math.ceil(total / limit) || 1,
//       currentPage: page,
//     };
//   }

//   private async getOptimizedCount(
//     queryBuilder: SelectQueryBuilder<Vehicle>,
//     hasFilters: boolean,
//   ): Promise<number> {
//     if (hasFilters) {
//       return await queryBuilder.getCount();
//     }

//     try {
//       const result = await this.vehicleRespository.query<{ estimate: number }>(
//         `
//                  SELECT reltuples::bigint AS estimate FROM pg_class c
//                 JOIN pg_namespace n ON n.oid = c.relnamespace
//                 WHERE n.nspname = 'master_vehicle' AND c.relname = 'vehicles';
//                 `,
//       );

//       const estimate = result[0]?.estimate ? Number(result[0].estimate) : 0;
//       return estimate < 1000 ? await this.vehicleRespository.count() : estimate;
//     } catch {
//       return await this.vehicleRespository.count();
//     }
//   }

//   async findOne(id: string): Promise<Vehicle> {
//     const vehicle = await this.vehicleRespository.findOne({
//       where: { id },
//       relations: {
//         station: true,
//         group: true,
//         vehicle_model: true,
//       },
//       select: {
//         station: {
//           id: true,
//           station_name: true,
//         },
//         group: {
//           id: true,
//           group_name: true,
//         },
//         vehicle_model: {
//           id: true,
//           vehicle_model_name: true,
//         },
//         id: true,
//         vehicle_name: true,
//         city_taxi_no: true,
//         serial_no: true,
//         vin_no: true,
//         engine_no: true,
//         license_plate: true,
//         color: true,
//         license_type: true,
//         current_odometer: true,
//         vehicle_license_exp: true,
//         service_intervals: true,
//         purchase_date: true,
//         image: true,
//         status: true,
//       },
//     });

//     if (!vehicle) {
//       throw new NotFoundException('Vehicle not found');
//     }

//     return vehicle;
//   }

//   async update(
//     id: string,
//     updateDto: UpdateVehicleDto,
//     file?: Express.Multer.File,
//   ): Promise<Vehicle> {
//     // const vehicle=await this.vehicleRespository.findOne({
//     //     where:{id},
//     //     relations:['station','group','vehicle_model'],

//     // });

//     // if(!vehicle){
//     //     throw new NotFoundException('Vehicle not found');
//     // }

//     await this.findOne(id);

//     if (file) {
//       const optimizedFile = await this.optimizeImageService.optimizeImage(file);
//       const imageUrl = await this.fileService.uploadFile(
//         optimizedFile,
//         'vehicle',
//       );
//       updateDto.image = imageUrl;
//     }

//     return await this.opService.update<Vehicle>(
//       this.vehicleRespository,
//       id,
//       updateDto,
//     );
//   }

//   async remove(id: string): Promise<Vehicle> {
//     await this.findOne(id);
//     return await this.opService.remove<Vehicle>(this.vehicleRespository, id);
//   }
// }

import { OpService } from 'src/common/service/op.service';
import { Repository } from 'typeorm';
import { Vehicle } from './entities/vehicle.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateVehicleDto } from './dtos/create-vehicle.dto';
import { OptimizeImageService } from 'src/common/service/optimize-image.service';
import { IFileService } from 'src/common/service/i-file.service';
import { BadRequestException, Inject } from '@nestjs/common';
import { UpdateVehicleDto } from './dtos/update-vehicle.dto';
import { NotFoundException } from '@nestjs/common';
import { SelectQueryBuilder } from 'typeorm/browser';
import { PaginateVehicleDto } from './dtos/paginate-vehicle.dto';
import { MasterAuditService } from 'src/modules/master-audit/audit/audit.service';
import { getChanges } from 'src/common/utils/object.util';

export class MasterVehicleService {
  constructor(
    @InjectRepository(Vehicle)
    private readonly vehicleRespository: Repository<Vehicle>,

    @Inject(IFileService)
    private readonly fileService: IFileService,
    private readonly optimizeImageService: OptimizeImageService,
    private readonly opService: OpService,
    private readonly auditService: MasterAuditService,
  ) {}

  async create(
    dto: CreateVehicleDto,
    userId: string,
    file?: Express.Multer.File,
  ): Promise<Vehicle> {
    if (file) {
      const optimizedFile = await this.optimizeImageService.optimizeImage(file);
      const imageUrl = await this.fileService.uploadFile(
        optimizedFile,
        'vehicle',
      );
      dto.image = imageUrl;
    }

    const newVehicle = this.vehicleRespository.create(dto);
    const savedVehicle = await this.vehicleRespository.save(newVehicle);

    await this.auditService.logAction(
      'vehicle',
      savedVehicle.id,
      'CREATE',
      null,
      { ...dto },
      userId,
    );
    return savedVehicle;
  }

  async findAll(query: PaginateVehicleDto) {
    const {
      page = 1,
      limit = 10,
      search,
      lastId,
      station_id: stations_id,
      group_id: groups_id,
      vehicle_model_id: vehicle_models_id,
      supplier_id: suppliers_id,
      status,
      lastCreatedAt,
      startDate,
      endDate,
    } = query;

    const queryBuilder = this.vehicleRespository.createQueryBuilder('vehicles');
    queryBuilder
      .leftJoinAndSelect('vehicles.station', 'station')
      .leftJoinAndSelect('vehicles.group', 'group')
      .leftJoinAndSelect('vehicles.vehicle_model', 'vehicle_model');

    queryBuilder.addSelect([
      'station.id',
      'station.station_name',
      'group.id',
      'group.group_name',
      'vehicle_model.id',
      'vehicle_model.vehicle_model_name',
    ]);

    if (stations_id) {
      queryBuilder.andWhere('vehicles.station=:stations_id', { stations_id });
    }

    if (groups_id) {
      queryBuilder.andWhere('vehicles.group=:groups_id', { groups_id });
    }

    if (vehicle_models_id) {
      queryBuilder.andWhere('vehicles.vehicle_model=:vehicle_models_id', {
        vehicle_models_id,
      });
    }

    if (suppliers_id) {
      queryBuilder.andWhere('vehicles.supplier_id=:suppliers_id', {
        suppliers_id,
      });
    }

    if (status) {
      queryBuilder.andWhere('vehicles.status=:status', { status });
    }

    if (search) {
      queryBuilder.andWhere(
        `(vehicles.vehicle_name ILike :search 
                OR vehicles.license_plate ILike :search
                OR vehicles.city_taxi_no ILike :search
                OR vehicles.serial_no ILike :search
                OR vehicles.vin_no ILike :search
                OR vehicles.engine_no ILike :search
                OR vehicles.color ILike :search
                OR vehicles.license_type ILike :search
                OR vehicles.current_odometer ILike :search
                OR CAST(vehicles.vehicle_license_exp AS TEXT) ILike :search
                OR CAST(vehicles.service_intervals AS TEXT) ILike :search
                OR CAST(vehicles.purchase_date AS TEXT) ILike :search)
                `,
        { search: `%${search}%` },
      );
    }

    if (startDate || endDate) {
      if (startDate) {
        queryBuilder.andWhere('vehicles.createdAt >= :startDate', {
          startDate: `${startDate} 00:00:00`,
        });
      }
      if (endDate) {
        queryBuilder.andWhere('vehicles.createdAt <= :endDate', {
          endDate: `${endDate} 23:59:59`,
        });
      }
    }

    if (lastId && lastCreatedAt && lastId !== 'undefined') {
      queryBuilder.andWhere(
        '(vehicles.createdAt < :lastCreatedAt OR (vehicles.createdAt = :lastCreatedAt AND vehicles.id < :lastId))',
        { lastCreatedAt, lastId },
      );
    } else {
      const skip = (Number(page) - 1) * Number(limit);
      queryBuilder.skip(skip);
    }

    const rawData = await queryBuilder
      .orderBy('vehicles.createdAt', 'DESC')
      .addOrderBy('vehicles.id', 'DESC')
      .take(Number(limit))
      .getMany();

    const data = rawData.map((vehicle) => ({
      id: vehicle.id,
      vehicle_name: vehicle.vehicle_name,
      city_taxi_no: vehicle.city_taxi_no,
      serial_no: vehicle.serial_no,
      vin_no: vehicle.vin_no,
      engine_no: vehicle.engine_no,
      license_plate: vehicle.license_plate,
      color: vehicle.color,
      license_type: vehicle.license_type,
      current_odometer: vehicle.current_odometer,
      vehicle_license_exp: vehicle.vehicle_license_exp,
      service_intervals: vehicle.service_intervals,
      purchase_date: vehicle.purchase_date,
      image: vehicle.image,
      status: vehicle.status,
      station_id: vehicle.station?.id || null,
      station_name: vehicle.station?.station_name || null,
      group_id: vehicle.group?.id || null,
      group_name: vehicle.group?.group_name || null,
      vehicle_model_id: vehicle.vehicle_model?.id || null,
      vehicle_model_name: vehicle.vehicle_model?.vehicle_model_name || null,
      supplier_id: vehicle.supplier_id || null,
    }));

    const hasFilters = Boolean(
      search ||
      stations_id ||
      groups_id ||
      vehicle_models_id ||
      suppliers_id ||
      startDate ||
      endDate,
    );
    const total = await this.getOptimizedCount(queryBuilder, hasFilters);

    // Active & Inactive counts
    const activeCount = await this.vehicleRespository.count({
      where: { status: 'Active' },
    });
    const inactiveCount = total - activeCount > 0 ? total - activeCount : 0;

    let lastEditedBy = 'Unknown';
    try {
      const lastAudit = await this.vehicleRespository.query<
        { performed_by: string }[]
      >(
        `SELECT performed_by FROM master_audit.audit WHERE entity_name = 'vehicle' ORDER BY created_at DESC LIMIT 1`,
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
      totalPages: Math.ceil(total / Number(limit)) || 1,
      currentPage: Number(page),
      activeCount,
      inactiveCount,
      lastEditedBy,
    };
  }

  private async getOptimizedCount(
    queryBuilder: SelectQueryBuilder<Vehicle>,
    hasFilters: boolean,
  ): Promise<number> {
    if (hasFilters) {
      return await queryBuilder.getCount();
    }

    try {
      const result = await this.vehicleRespository.query<
        { estimate: string }[]
      >(
        `
         SELECT reltuples::bigint AS estimate FROM pg_class c 
         JOIN pg_namespace n ON n.oid = c.relnamespace
         WHERE n.nspname = 'master_vehicle' AND c.relname = 'vehicles';
        `,
      );

      const estimate = result[0]?.estimate ? Number(result[0].estimate) : 0;
      return estimate < 1000 ? await this.vehicleRespository.count() : estimate;
    } catch {
      return await this.vehicleRespository.count();
    }
  }

  async findOne(id: string): Promise<Vehicle> {
    const vehicle = await this.vehicleRespository.findOne({
      where: { id },
      relations: {
        station: true,
        group: true,
        vehicle_model: true,
      },
      select: {
        station: {
          id: true,
          station_name: true,
        },
        group: {
          id: true,
          group_name: true,
        },
        vehicle_model: {
          id: true,
          vehicle_model_name: true,
        },
        id: true,
        vehicle_name: true,
        city_taxi_no: true,
        serial_no: true,
        vin_no: true,
        engine_no: true,
        license_plate: true,
        color: true,
        license_type: true,
        current_odometer: true,
        vehicle_license_exp: true,
        service_intervals: true,
        purchase_date: true,
        image: true,
        status: true,
      },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    return vehicle;
  }

  async update(
    id: string,
    updateDto: UpdateVehicleDto,
    userId: string,
    file?: Express.Multer.File,
  ): Promise<Vehicle> {
    const oldVehicle = await this.findOne(id);
    let oldImageToDelete: string | null = null;

    if (file) {
      if (oldVehicle.image) {
        oldImageToDelete = oldVehicle.image;
      }
      const optimizedFile = await this.optimizeImageService.optimizeImage(file);
      updateDto.image = await this.fileService.uploadFile(
        optimizedFile,
        'vehicle',
      );
    }

    // opService.update အစား Repo ကို သုံး၍ အတိအကျ Update လုပ်ပါသည်
    await this.vehicleRespository.update(id, updateDto);
    const updatedVehicle = await this.findOne(id);

    if (oldImageToDelete) {
      await this.fileService.deleteFile(oldImageToDelete).catch((err) => {
        console.warn('Failed to delete old vehicle image:', err);
      });
    }

    const { oldVals, newVals } = getChanges(
      oldVehicle as unknown as Record<string, unknown>,
      updateDto as unknown as Record<string, unknown>,
    );

    if (Object.keys(newVals).length > 0) {
      await this.auditService.logAction(
        'vehicle',
        id,
        'UPDATE',
        oldVals,
        newVals,
        userId,
      );
    }

    return updatedVehicle;
  }

  async remove(id: string, userId: string): Promise<{ id: string }> {
    const vehicleToDelete = await this.findOne(id);

    try {
      await this.vehicleRespository.remove(vehicleToDelete);

      if (vehicleToDelete.image) {
        await this.fileService
          .deleteFile(vehicleToDelete.image)
          .catch((err) => {
            console.warn(`Failed to delete vehicle image for ID ${id}:`, err);
          });
      }

      await this.auditService.logAction(
        'vehicle',
        id,
        'DELETE',
        { ...vehicleToDelete },
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
          'Cannot delete this vehicle because it is currently assigned or associated with other active records.',
        );
      }
      throw error;
    }
  }

  async restoreVehicle(auditId: string, userId: string): Promise<Vehicle> {
    const auditRecord = await this.auditService.findOne(auditId);

    if (auditRecord.entity_name !== 'vehicle') {
      throw new BadRequestException('This audit record is not for vehicles');
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

    const existingVehicle = await this.vehicleRespository.findOne({
      where: { id: auditRecord.entity_id },
      withDeleted: true,
    });

    let restored: Vehicle;

    const toPlainObject = (data: unknown): Record<string, unknown> => {
      return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
    };

    const beforeState =
      existingVehicle !== null
        ? toPlainObject(existingVehicle)
        : { status: 'Permanently Deleted / Not Exists' };

    if (existingVehicle) {
      Object.assign(existingVehicle, safeDataToRestore);

      // Intersection type ဖြင့် သေချာစွာ စစ်ဆေးခြင်း
      const vehicleWithSoftDelete = existingVehicle as Vehicle & {
        deletedAt?: Date | null;
        deleted_at?: Date | null;
      };

      if (vehicleWithSoftDelete.deletedAt || vehicleWithSoftDelete.deleted_at) {
        vehicleWithSoftDelete.deletedAt = null;
        vehicleWithSoftDelete.deleted_at = null;
        // Soft delete ထားပါက recover ဖြင့် ပြန်ဆယ်ပါမည်
        restored = await this.vehicleRespository.recover(existingVehicle);
      } else {
        restored = await this.vehicleRespository.save(existingVehicle);
      }
    } else {
      const newVehicle = this.vehicleRespository.create(safeDataToRestore);
      restored = await this.vehicleRespository.save(newVehicle);
    }

    const afterState = {
      id: restored.id,
      ...safeDataToRestore,
    };

    await this.auditService.logAction(
      'vehicle',
      restored.id,
      'RESTORE',
      beforeState,
      afterState,
      userId,
    );

    return restored;
  }
}
