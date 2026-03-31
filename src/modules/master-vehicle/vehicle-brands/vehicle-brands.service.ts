// src\modules\master-vehicle\vehicle-brands\vehicle-brands.service.ts
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { VehicleBrands } from './entities/vehicle-brands.entity';
import { Repository } from 'typeorm';
import { CreateVehicleBrandsDto } from './dtos/create-vehicle-brands.dto';
import { IFileService } from 'src/common/service/i-file.service';
import { OpService } from 'src/common/service/op.service';
import { OptimizeImageService } from 'src/common/service/optimize-image.service';
import { UpdateVehicleBrandsDto } from './dtos/update-vehicle-brands.dto';
import { PaginateVehicleBrandDto } from './dtos/paginate-vehicle-brands.dto';

@Injectable()
export class VehicleBrandsService {
  constructor(
    @InjectRepository(VehicleBrands)
    private readonly vehicleBrandsRepo: Repository<VehicleBrands>,

    @Inject(IFileService)
    private readonly fileService: IFileService,
    private readonly opService: OpService,
    private readonly optimizeImageService: OptimizeImageService,
  ) {}

  async create(
    dto: CreateVehicleBrandsDto,
    file: Express.Multer.File,
  ): Promise<VehicleBrands> {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    const brandName = dto.vehicle_brand_name.trim().toUpperCase();
    const country = dto.country_of_origin.trim().toUpperCase();
    const manufacturer = dto.manufacturer.trim().toUpperCase();

    const exists = await this.vehicleBrandsRepo.findOne({
      where: { vehicle_brand_name: brandName },
    });

    if (exists) {
      throw new BadRequestException('Brand name already exists');
    }

    let imgUrl: string;

    try {
      const optimized = await this.optimizeImageService.optimizeImage(file);

      imgUrl = await this.fileService.uploadFile(optimized, 'vehicle-brands');
    } catch {
      throw new BadRequestException('Image upload failed');
    }

    const newBrand = this.vehicleBrandsRepo.create({
      ...dto,
      vehicle_brand_name: brandName,
      country_of_origin: country,
      manufacturer: manufacturer,
      image: imgUrl,
    });

    return await this.vehicleBrandsRepo.save(newBrand);
  }

  async findAll(query: PaginateVehicleBrandDto) {
    const {
      page,
      limit,
      search,
      lastId,
      lastCreatedAt,
      vehicle_brand_id: id,
      country_of_origin,
      manufacturer,
      startDate,
      endDate,
    } = query;

    const queryBuilder =
      this.vehicleBrandsRepo.createQueryBuilder('vehicle-brands');

    if (search) {
      queryBuilder.andWhere(
        `(vehicle_brands.vehicle_brand_name ILike :search 
          OR vehicle_brands.country_of_origin ILike :search 
          OR vehicle_brands.manufacturer ILike :search)`,
        { search: `%${search}%` },
      );
    }

    if (startDate || endDate) {
      if (startDate)
        queryBuilder.andWhere('staff.createdAt >= :startDate', {
          startDate: `${startDate} 00:00:00`,
        });
      if (endDate)
        queryBuilder.andWhere('staff.createdAt <= :endDate', {
          endDate: `${endDate} 23:59:59`,
        });
    }

    if (lastId && lastCreatedAt && lastId !== 'undefined') {
      queryBuilder.andWhere(
        '(vehicle_brands.createdAt < :lastCreatedAt OR (vehicle_brands.createdAt = :lastCreatedAt AND vehicle_brands.id < :lastId))',
        { lastCreatedAt, lastId },
      );
    } else {
      const skip = (page - 1) * limit;
      queryBuilder.skip(skip);
    }

    return await this.vehicleBrandsRepo.find();
  }

  async findOne(id: string): Promise<VehicleBrands> {
    const brand = await this.vehicleBrandsRepo.findOne({ where: { id } });

    if (!brand) throw new NotFoundException('Brand not found.');

    return brand;
  }

  async update(
    id: string,
    dto: UpdateVehicleBrandsDto,
    file?: Express.Multer.File,
  ): Promise<VehicleBrands> {
    const brand = await this.findOne(id);
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
      }

      for (const [key, value] of Object.entries(dto)) {
        if (value !== undefined) {
          (brand as any)[key] = value;
        }
      }

      const saved = await this.vehicleBrandsRepo.save(brand);

      if (file && oldImage) {
        await this.fileService
          .deleteFile(oldImage)
          .catch((err) => console.error('Failed to delete old image:', err));
      }

      return saved;
    } catch (error) {
      if (newImage) {
        await this.fileService
          .deleteFile(newImage)
          .catch((err) => console.error('Rollback delete failed:', err));
      }
      throw error;
    }
  }

  async remove(id: string): Promise<VehicleBrands> {
    const brand = await this.findOne(id);

    await this.opService.remove<VehicleBrands>(this.vehicleBrandsRepo, id);

    if (brand.image) {
      await this.fileService
        .deleteFile(brand.image)
        .catch((err) =>
          console.error('Failed to delete image during removal:', err),
        );
    }

    return brand;
  }
}
