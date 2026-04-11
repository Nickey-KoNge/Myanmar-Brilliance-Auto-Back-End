import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VehicleModels } from './entities/vehicle-model.entity';
import { CreateVehicleModelDto } from './dtos/create-vehicle-model.dto';
import { UpdateVehicleModelDto } from './dtos/update-vehicle-model.dto';
import { PaginateVehicleModelDto } from './dtos/paginate-vehicle-model.dto';

@Injectable()
export class VehicleModelService {
  constructor(
    @InjectRepository(VehicleModels)
    private readonly repo: Repository<VehicleModels>,
  ) {}

  async findAll(query: PaginateVehicleModelDto) {
    const {
      search,
      startDate,
      endDate,
      page = 1,
      limit = 10,
      vehicle_brand_id,
    } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.repo.createQueryBuilder('vm');

    // Select specific fields for better performance
    queryBuilder.leftJoinAndSelect('vm.vehicle_brand', 'brand'); // Brand name ပါလာစေရန် join ထားခြင်း

    // Search logic similar to Driver service
    if (search) {
      queryBuilder.andWhere(
        '(vm.vehicle_model_name ILIKE :search OR vm.body_type ILIKE :search OR vm.fuel_type ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Brand ID filter
    if (vehicle_brand_id) {
      queryBuilder.andWhere('vm.vehicle_brand_id = :brandId', {
        brandId: vehicle_brand_id,
      });
    }

    // Date Range Filter
    if (startDate && endDate) {
      queryBuilder.andWhere('vm.createdAt BETWEEN :start AND :end', {
        start: `${startDate} 00:00:00`,
        end: `${endDate} 23:59:59`,
      });
    }

    queryBuilder.skip(skip).take(limit).orderBy('vm.createdAt', 'DESC');

    const [items, total] = await queryBuilder.getManyAndCount();

    // Status counts
    const activeCount = await this.repo.count({ where: { status: 'Active' } });
    const inactiveCount = await this.repo.count({
      where: { status: 'Inactive' },
    });

    // Brands list for search filter dropdown (Raw query approach like driver service)
    const brands = await this.repo.manager.query(
      `SELECT id, vehicle_brand_name as name FROM "master_vehicle"."vehicle_brands" ORDER BY vehicle_brand_name ASC`,
    );

    return {
      items,
      brands,
      meta: {
        totalItems: total,
        itemCount: items.length,
        itemsPerPage: Number(limit),
        totalPages: Math.ceil(total / limit),
        currentPage: Number(page),
        activeItems: activeCount,
        inactiveItems: inactiveCount,
      },
    };
  }

  async findOne(id: string) {
    const model = await this.repo.findOne({
      where: { id },
      relations: ['vehicle_brand'],
    });

    if (!model) {
      throw new NotFoundException(`Vehicle Model with ID ${id} not found`);
    }

    return model;
  }

  async create(dto: CreateVehicleModelDto) {
    const model = this.repo.create(dto);
    return await this.repo.save(model);
  }

  async update(id: string, dto: UpdateVehicleModelDto) {
    const model = await this.findOne(id);

    Object.assign(model, dto);

    return await this.repo.save(model);
  }

  async remove(id: string) {
    const model = await this.findOne(id);

    return await this.repo.remove(model);
  }
}
