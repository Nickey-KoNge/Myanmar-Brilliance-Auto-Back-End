import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, FindOptionsWhere } from 'typeorm';
import { VehicleModels } from './entities/vehicle-model.entity';
import { CreateVehicleModelDto } from './dtos/create-vehicle-model.dto';
import { UpdateVehicleModelDto } from './dtos/update-vehicle-model.dto';
import { PaginateVehicleModelDto } from './dtos/paginate-vehicle-model.dto';
import { MasterAuditService } from 'src/modules/master-audit/audit/audit.service';
import { getChanges } from 'src/common/utils/object.util';

interface QueryParams {
  limit?: number | string;
  page?: number | string;
  lastId?: string;
  lastCreatedAt?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  vehicle_brand_id?: string;
}

@Injectable()
export class VehicleModelService {
  constructor(
    @InjectRepository(VehicleModels)
    private readonly repo: Repository<VehicleModels>,
    private readonly auditService: MasterAuditService,
  ) {}

  async create(
    dto: CreateVehicleModelDto,
    userId: string,
  ): Promise<VehicleModels> {
    try {
      const newModel = this.repo.create(dto);
      const savedModel = await this.repo.save(newModel);
      await this.auditService.logAction(
        'vehicle_models',
        savedModel.id,
        'CREATE',
        null,
        { ...dto },
        userId,
      );
      return savedModel;
    } catch {
      throw new InternalServerErrorException('Failed to create vehicle model');
    }
  }
  
  async findAll(query: PaginateVehicleModelDto) {
    const {
      limit = 10,
      page = 1,
      lastId,
      lastCreatedAt,
      search,
      startDate,
      endDate,
      vehicle_brand_id: brandId,
    } = query as unknown as QueryParams;

    const queryBuilder = this.repo.createQueryBuilder('vm');

    queryBuilder.leftJoinAndSelect('vm.vehicle_brand', 'brand');

    if (brandId) {
      queryBuilder.andWhere('vm.vehicle_brand_id = :brandId', {
        brandId: String(brandId),
      });
    }

    if (search) {
      queryBuilder.andWhere(
        `(vm.vehicle_model_name ILike :search 
          OR vm.body_type ILike :search 
          OR vm.fuel_type ILike :search
          OR vm.transmission ILike :search)`,
        { search: `%${String(search)}%` },
      );
    }

    if (startDate || endDate) {
      if (startDate)
        queryBuilder.andWhere('vm.createdAt >= :startDate', {
          startDate: `${String(startDate)} 00:00:00`,
        });
      if (endDate)
        queryBuilder.andWhere('vm.createdAt <= :endDate', {
          endDate: `${String(endDate)} 23:59:59`,
        });
    }

    // 🛑 skip နှင့် ပတ်သက်သော Error ကင်းရှင်းစေရန် ဤနေရာတွင်သာ အတိအကျ တွက်ချက်ပါသည်
    if (lastId && lastCreatedAt && lastId !== 'undefined') {
      queryBuilder.andWhere(
        '(vm.createdAt < :lastCreatedAt OR (vm.createdAt = :lastCreatedAt AND vm.id < :lastId))',
        {
          lastCreatedAt: String(lastCreatedAt),
          lastId: String(lastId),
        },
      );
    } else {
      // 🛑 skip ဟု တိုက်ရိုက်ပြန်လည် ကြေညာ၍ အသုံးပြုခြင်း (ReferenceError ရှင်းရန်)
      const skip = (Number(page) - 1) * Number(limit);
      queryBuilder.skip(skip);
    }

    // Fetch raw data
    // 🛑 ဤနေရာတွင် .skip() ကို ထပ်ခေါ်ရန်မလိုတော့ပါ။ အပေါ်က else block တွင် လုပ်ပြီးသားဖြစ်ပါသည်။
    const rawData = await queryBuilder
      .orderBy('vm.createdAt', 'DESC')
      .addOrderBy('vm.id', 'DESC')
      .take(Number(limit))
      .getMany();

    const data = rawData.map((model) => ({
      id: model.id,
      vehicle_model_name: model.vehicle_model_name,
      body_type: model.body_type,
      fuel_type: model.fuel_type,
      transmission: model.transmission,
      engine_capacity: model.engine_capacity,
      year_of_release: model.year_of_release,
      status: model.status,
      vehicle_brand_id: model.vehicle_brand_id,
      vehicle_brand_name: model.vehicle_brand?.vehicle_brand_name || null,
    }));

    const hasFilters = !!(search || startDate || endDate || brandId);
    const total = await this.getOptimizedCount(queryBuilder, hasFilters);

    const activeCount = await this.repo.count({
      where: { status: 'Active' },
    });
    const inactiveCount = total - activeCount > 0 ? total - activeCount : 0;

    let lastEditedBy = 'Unknown';
    try {
      const lastAudit = await this.repo.query<{ performed_by: string }[]>(
        `SELECT performed_by FROM master_audit.audit WHERE entity_name = 'vehicle_models' ORDER BY created_at DESC LIMIT 1`,
      );
      if (lastAudit && lastAudit.length > 0) {
        lastEditedBy = lastAudit[0].performed_by;
      }
    } catch (auditError) {
      console.log('Error fetching last audit:', auditError);
    }

    const brands = await this.repo.query<{ id: string; name: string }[]>(
      `SELECT id, vehicle_brand_name as name FROM "master_vehicle"."vehicle_brands" ORDER BY vehicle_brand_name ASC`,
    );

    return {
      data,
      items: data,
      brands,
      total,
      totalPages: Math.ceil(total / Number(limit)) || 1,
      currentPage: Number(page),
      activeCount,
      inactiveCount,
      lastEditedBy,
      meta: {
        totalItems: total,
        totalPages: Math.ceil(total / Number(limit)) || 1,
        activeItems: activeCount,
        inactiveItems: inactiveCount,
        lastEditedBy,
      },
    };
  }
  private async getOptimizedCount(
    queryBuilder: SelectQueryBuilder<VehicleModels>,
    hasFilters: boolean,
  ): Promise<number> {
    if (hasFilters) {
      return await queryBuilder.getCount();
    }

    try {
      const result = await this.repo.query<{ estimate: string }[]>(
        `SELECT reltuples::bigint AS estimate FROM pg_class c 
         JOIN pg_namespace n ON n.oid = c.relnamespace 
         WHERE n.nspname = 'master_vehicle' AND c.relname = 'vehicle_models'`,
      );

      const estimate = result?.[0]?.estimate ? Number(result[0].estimate) : 0;
      return estimate < 1000 ? await this.repo.count() : estimate;
    } catch {
      return await this.repo.count();
    }
  }

  async findOne(id: string): Promise<VehicleModels> {
    const model = await this.repo.findOne({
      where: { id } as unknown as FindOptionsWhere<VehicleModels>,
      relations: ['vehicle_brand'],
      select: {
        id: true,
        vehicle_model_name: true,
        body_type: true,
        fuel_type: true,
        transmission: true,
        engine_capacity: true,
        year_of_release: true,
        status: true,
        vehicle_brand_id: true,
        vehicle_brand: { id: true, vehicle_brand_name: true },
      },
    });
    if (!model)
      throw new NotFoundException(`Vehicle Model with ID ${id} not found`);
    return model;
  }

  async update(
    id: string,
    dto: UpdateVehicleModelDto,
    userId: string,
  ): Promise<VehicleModels> {
    const oldModel = await this.findOne(id);
    await this.repo.update(id, dto);

    const updatedModel = await this.findOne(id);

    const { oldVals, newVals } = getChanges(
      oldModel as unknown as Record<string, unknown>,
      dto as unknown as Record<string, unknown>,
    );
    if (Object.keys(newVals).length > 0) {
      await this.auditService.logAction(
        'vehicle_models',
        id,
        'UPDATE',
        oldVals,
        newVals,
        userId,
      );
    }

    return updatedModel;
  }

  async remove(id: string, userId: string): Promise<{ id: string }> {
    const modelToDelete = await this.findOne(id);
    try {
      await this.repo.remove(modelToDelete);

      await this.auditService.logAction(
        'vehicle_models',
        id,
        'DELETE',
        { ...modelToDelete },
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
          'Cannot delete this Vehicle Model because it is currently assigned to vehicles. Please remove or reassign them first.',
        );
      }
      throw error;
    }
  }

  async restoreVehicleModel(
    auditId: string,
    userId: string,
  ): Promise<VehicleModels> {
    const auditRecord = await this.auditService.findOne(auditId);

    if (auditRecord.entity_name !== 'vehicle_models') {
      throw new BadRequestException(
        'This audit record is not for vehicle models',
      );
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

    delete safeDataToRestore['vehicle_brand'];

    const existingModel = await this.repo.findOne({
      where: {
        id: auditRecord.entity_id,
      } as unknown as FindOptionsWhere<VehicleModels>,
      withDeleted: true,
    });

    let restored: VehicleModels;

    const toPlainObject = (data: unknown): Record<string, unknown> => {
      return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
    };

    const beforeState =
      existingModel !== null
        ? toPlainObject(existingModel)
        : { status: 'Permanently Deleted / Not Exists' };

    try {
      if (existingModel) {
        Object.assign(existingModel, safeDataToRestore);

        const modelWithSoftDelete = existingModel as VehicleModels & {
          deletedAt?: Date | null;
          deleted_at?: Date | null;
        };

        if (modelWithSoftDelete.deletedAt || modelWithSoftDelete.deleted_at) {
          modelWithSoftDelete.deletedAt = null;
          modelWithSoftDelete.deleted_at = null;
          restored = await this.repo.recover(existingModel);
        } else {
          restored = await this.repo.save(existingModel);
        }
      } else {
        const newModel = this.repo.create({
          ...safeDataToRestore,
          id: String(auditRecord.entity_id),
        });
        restored = await this.repo.save(newModel);
      }
    } catch (error) {
      console.error('Restore Vehicle Model Error: ', error);
      throw new InternalServerErrorException(
        'Failed to restore the record due to Data Integrity or Constraint errors.',
      );
    }

    const afterState = {
      id: restored.id,
      ...safeDataToRestore,
    };

    await this.auditService.logAction(
      'vehicle_models',
      restored.id,
      'RESTORE',
      beforeState,
      afterState,
      userId,
    );

    return restored;
  }
}
