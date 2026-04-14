// src\modules\master-vehicle\vehicle-brands\vehicle-brands.service.ts
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { VehicleBrands } from './entities/vehicle-brands.entity';
import {
  DataSource,
  Repository,
  SelectQueryBuilder,
  FindOptionsWhere,
} from 'typeorm';
import { CreateVehicleBrandsDto } from './dtos/create-vehicle-brands.dto';
import { IFileService } from 'src/common/service/i-file.service';
import { OpService } from 'src/common/service/op.service';
import { OptimizeImageService } from 'src/common/service/optimize-image.service';
import { UpdateVehicleBrandsDto } from './dtos/update-vehicle-brands.dto';
import { PaginateVehicleBrandDto } from './dtos/paginate-vehicle-brands.dto';
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
}

@Injectable()
export class VehicleBrandsService {
  constructor(
    @InjectRepository(VehicleBrands)
    private readonly vehicleBrandsRepo: Repository<VehicleBrands>,
    private readonly dataSource: DataSource,

    @Inject(IFileService)
    private readonly fileService: IFileService,
    private readonly opService: OpService,
    private readonly optimizeImageService: OptimizeImageService,
    private readonly auditService: MasterAuditService,
  ) {}

  async create(
    dto: CreateVehicleBrandsDto,
    userId: string,
    file: Express.Multer.File,
  ): Promise<VehicleBrands> {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let imgUrl: string | undefined;

    const brandName = dto.vehicle_brand_name.trim().toUpperCase();
    const country = dto.country_of_origin.trim().toUpperCase();
    const manufacturer = dto.manufacturer.trim().toUpperCase();

    try {
      const exists = await queryRunner.manager.findOne(VehicleBrands, {
        where: { vehicle_brand_name: brandName },
      });

      if (exists) {
        throw new BadRequestException('Brand name already exists');
      }

      const optimized = await this.optimizeImageService.optimizeImage(file);
      imgUrl = await this.fileService.uploadFile(optimized, 'vehicle-brands');

      const newBrand = queryRunner.manager.create(VehicleBrands, {
        ...dto,
        vehicle_brand_name: brandName,
        country_of_origin: country,
        manufacturer: manufacturer,
        image: imgUrl,
      });

      const savedBrand = await queryRunner.manager.save(newBrand);

      await queryRunner.commitTransaction();

      await this.auditService.logAction(
        'vehicle_brands',
        savedBrand.id,
        'CREATE',
        null,
        { ...dto, image: imgUrl },
        userId,
      );

      return savedBrand;
    } catch (error) {
      await queryRunner.rollbackTransaction();

      if (imgUrl) {
        await this.fileService.deleteFile(imgUrl);
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';

      throw new BadRequestException(
        `Creation failed! ${errorMessage}. All changes rolled back.`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(query: PaginateVehicleBrandDto) {
    const {
      page = 1,
      limit = 10,
      search,
      lastId,
      lastCreatedAt,
      startDate,
      endDate,
    } = query as unknown as QueryParams;

    const queryBuilder =
      this.vehicleBrandsRepo.createQueryBuilder('vehicle_brands');

    if (search) {
      queryBuilder.andWhere(
        `(
          vehicle_brands.vehicle_brand_name ILike :search 
          OR vehicle_brands.country_of_origin ILike :search 
          OR vehicle_brands.manufacturer ILike :search
        )`,
        { search: `%${String(search)}%` },
      );
    }

    if (startDate || endDate) {
      if (startDate)
        queryBuilder.andWhere('vehicle_brands.createdAt >= :startDate', {
          startDate: `${String(startDate)} 00:00:00`,
        });
      if (endDate)
        queryBuilder.andWhere('vehicle_brands.createdAt <= :endDate', {
          endDate: `${String(endDate)} 23:59:59`,
        });
    }

    if (lastId && lastCreatedAt && lastId !== 'undefined') {
      queryBuilder.andWhere(
        '(vehicle_brands.createdAt < :lastCreatedAt OR (vehicle_brands.createdAt = :lastCreatedAt AND vehicle_brands.id < :lastId))',
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
      .orderBy('vehicle_brands.createdAt', 'DESC')
      .addOrderBy('vehicle_brands.id', 'DESC')
      .take(Number(limit))
      .getMany();

    const data = rawData.map((vehicle_brand) => ({
      id: vehicle_brand.id,
      vehicle_brand_name: vehicle_brand.vehicle_brand_name,
      country_of_origin: vehicle_brand.country_of_origin,
      manufacturer: vehicle_brand.manufacturer,
      image: vehicle_brand.image,
      description: vehicle_brand.description,
    }));

    const hasFilters = !!(search || startDate || endDate);
    const total = await this.getOptimizedCount(queryBuilder, hasFilters);

    // Active / Inactive Audit Stats
    const activeCount = total; // Brand တွင် status column မရှိပါက total ကိုသာ ပြပါမည် (ရှိပါက where: {status: 'Active'} စစ်ပါ)
    const inactiveCount = 0;

    let lastEditedBy = 'Unknown';
    try {
      const lastAudit = await this.vehicleBrandsRepo.query<
        { performed_by: string }[]
      >(
        `SELECT performed_by FROM master_audit.audit WHERE entity_name = 'vehicle_brands' ORDER BY created_at DESC LIMIT 1`,
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
    queryBuilder: SelectQueryBuilder<VehicleBrands>,
    hasFilters: boolean,
  ): Promise<number> {
    if (hasFilters) {
      return await queryBuilder.getCount();
    }

    try {
      const result = await this.vehicleBrandsRepo.query<{ estimate: string }[]>(
        `SELECT reltuples::bigint AS estimate FROM pg_class c 
             JOIN pg_namespace n ON n.oid = c.relnamespace 
             WHERE n.nspname = 'master_vehicle' AND c.relname = 'vehicle_brands'`,
      );

      const estimate = result?.[0]?.estimate ? Number(result[0].estimate) : 0;
      return estimate < 1000 ? await this.vehicleBrandsRepo.count() : estimate;
    } catch {
      return await this.vehicleBrandsRepo.count();
    }
  }

  async findOne(id: string): Promise<VehicleBrands> {
    const brand = await this.vehicleBrandsRepo.findOne({
      where: { id } as unknown as FindOptionsWhere<VehicleBrands>,
    });

    if (!brand) throw new NotFoundException('Brand not found.');

    return brand;
  }

  async update(
    id: string,
    dto: UpdateVehicleBrandsDto,
    userId: string,
    file?: Express.Multer.File,
  ): Promise<VehicleBrands> {
    const brand = await this.findOne(id);

    const oldState = { ...brand };

    const oldImage = brand.image;
    let newImage: string | undefined;

    if (
      dto.vehicle_brand_name &&
      dto.vehicle_brand_name.trim().toUpperCase() !== brand.vehicle_brand_name
    ) {
      dto.vehicle_brand_name = dto.vehicle_brand_name.trim().toUpperCase();

      const exists = await this.vehicleBrandsRepo.findOne({
        where: { vehicle_brand_name: dto.vehicle_brand_name },
      });

      if (exists) {
        throw new BadRequestException('Brand name already exists');
      }
    }

    if (dto.country_of_origin) {
      dto.country_of_origin = dto.country_of_origin.trim().toUpperCase();
    }

    if (dto.manufacturer) {
      dto.manufacturer = dto.manufacturer.trim().toUpperCase();
    }

    try {
      if (file) {
        const optimized = await this.optimizeImageService.optimizeImage(file);
        newImage = await this.fileService.uploadFile(
          optimized,
          'vehicle-brands',
        );
        brand.image = newImage;
        dto.image = newImage;
      }

      Object.assign(brand, dto);

      const savedBrand = await this.vehicleBrandsRepo.save(brand);

      if (file && oldImage) {
        await this.fileService
          .deleteFile(oldImage)
          .catch((err) => console.warn('Failed to delete old image:', err));
      }

      const cleanOldState = JSON.parse(JSON.stringify(oldState)) as Record<
        string,
        unknown
      >;
      const cleanNewState = JSON.parse(JSON.stringify(savedBrand)) as Record<
        string,
        unknown
      >;

      const { oldVals, newVals } = getChanges(cleanOldState, cleanNewState);

      if (Object.keys(newVals).length > 0) {
        await this.auditService.logAction(
          'vehicle_brands',
          id,
          'UPDATE',
          oldVals,
          newVals,
          userId,
        );
      }

      return savedBrand;
    } catch (error) {
      if (newImage) {
        await this.fileService
          .deleteFile(newImage)
          .catch((err) => console.warn('Rollback delete failed:', err));
      }
      throw error;
    }
  }

  async remove(id: string, userId: string): Promise<VehicleBrands> {
    const brand = await this.findOne(id);
    const oldState = { ...brand };

    try {
      await this.opService.remove<VehicleBrands>(this.vehicleBrandsRepo, id);

      if (brand.image) {
        await this.fileService
          .deleteFile(brand.image)
          .catch((err) =>
            console.warn('Failed to delete image during removal:', err),
          );
      }

      const cleanOldState = JSON.parse(JSON.stringify(oldState)) as Record<
        string,
        unknown
      >;
      await this.auditService.logAction(
        'vehicle_brands',
        id,
        'DELETE',
        cleanOldState,
        null,
        userId,
      );

      return brand;
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as Record<string, unknown>).code === '23503'
      ) {
        throw new BadRequestException(
          'Cannot delete this brand because it is currently assigned to vehicle models. Please remove them first.',
        );
      }
      throw error;
    }
  }

  async restoreVehicleBrand(
    auditId: string,
    userId: string,
  ): Promise<VehicleBrands> {
    const auditRecord = await this.auditService.findOne(auditId);

    if (auditRecord.entity_name !== 'vehicle_brands') {
      throw new BadRequestException(
        'This audit record is not for vehicle brands',
      );
    }

    const rawOldValues = (
      typeof auditRecord.old_values === 'string'
        ? JSON.parse(auditRecord.old_values)
        : auditRecord.old_values
    ) as Record<string, unknown> | null;

    if (!rawOldValues || Object.keys(rawOldValues).length === 0) {
      throw new BadRequestException(
        'No old data available to restore from this action',
      );
    }

    const dataToRestore = JSON.parse(JSON.stringify(rawOldValues)) as Record<
      string,
      unknown
    >;
    delete dataToRestore['deleted_at'];
    delete dataToRestore['deletedAt'];
    delete dataToRestore['updated_at'];
    delete dataToRestore['updatedAt'];

    const existingBrand = await this.vehicleBrandsRepo.findOne({
      where: {
        id: auditRecord.entity_id,
      } as unknown as FindOptionsWhere<VehicleBrands>,
      withDeleted: true,
    });

    const toPlainObject = (data: unknown): Record<string, unknown> => {
      return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
    };

    const beforeState =
      existingBrand !== null
        ? toPlainObject(existingBrand)
        : { status: 'Permanently Deleted / Not Exists' };

    let restoredBrand: VehicleBrands;

    try {
      if (existingBrand) {
        if ('deletedAt' in existingBrand) {
          (
            existingBrand as VehicleBrands & { deletedAt?: Date | null }
          ).deletedAt = null;
        }

        Object.assign(existingBrand, dataToRestore);
        restoredBrand = await this.vehicleBrandsRepo.save(existingBrand);
      } else {
        const newBrand = this.vehicleBrandsRepo.create(dataToRestore);
        // Force ID for exact restoration
        Object.assign(newBrand, { id: auditRecord.entity_id });
        restoredBrand = await this.vehicleBrandsRepo.save(newBrand);
      }

      const afterState = {
        id: restoredBrand.id,
        ...dataToRestore,
      };

      await this.auditService.logAction(
        'vehicle_brands',
        restoredBrand.id,
        'RESTORE',
        beforeState,
        afterState,
        userId,
      );

      return restoredBrand;
    } catch (error: unknown) {
      console.error('Restore Error:', error);
      throw new InternalServerErrorException(
        'Failed to restore vehicle brand due to database constraints.',
      );
    }
  }
}
