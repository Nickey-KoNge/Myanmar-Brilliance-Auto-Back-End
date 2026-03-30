import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Driver } from './entities/driver.entity';
import { OpService } from '../../../common/service/op.service';
import { IFileService } from '../../../common/service/i-file.service';
import { CreateDriverDto } from './dtos/create-driver.dto';
import { UpdateDriverDto } from './dtos/update-driver.dto';

@Injectable()
export class DriverService {
  constructor(
    @InjectRepository(Driver) private readonly repo: Repository<Driver>,
    private readonly opService: OpService,
    @Inject(IFileService) private readonly fileService: IFileService,
  ) {}

  async findAll(query: any) {
    const { search, fromDate, toDate, page, limit } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.repo.createQueryBuilder('driver');

    if (search) {
      queryBuilder.andWhere(
        '(driver.driver_name ILIKE :search OR driver.phone ILIKE :search OR driver.address ILIKE :search OR driver.nrc ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (fromDate && toDate) {
      queryBuilder.andWhere('driver.createdAt BETWEEN :fromDate AND :toDate', {
        fromDate,
        toDate,
      });
    }

    queryBuilder.skip(skip).take(limit).orderBy('driver.createdAt', 'DESC');

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      items,
      meta: {
        totalItems: total,
        itemCount: items.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
    };
  }

  async createDriver(dto: CreateDriverDto, file?: Express.Multer.File) {
    let imageUrl: string | null = null;
    if (file) {
      imageUrl = await this.fileService.uploadFile(file, 'drivers');
    }

    // If station_id is not provided, it will be saved as null in the DB
    return this.opService.create(this.repo, {
      ...dto,
      image: imageUrl,
      station_id: dto.station_id || null,
    });
  }

  async update(id: string, dto: UpdateDriverDto, file?: Express.Multer.File) {
    const driver = await this.repo.findOne({ where: { id } });
    if (!driver) {
      throw new NotFoundException(`Driver with ID ${id} not found`);
    }

    let imageUrl = driver.image; // Keep old image by default
    if (file) {
      imageUrl = await this.fileService.uploadFile(file, 'drivers');
    }

    // Merge the new data into the existing entity
    Object.assign(driver, {
      ...dto,
      image: imageUrl,
      station_id: dto.station_id || driver.station_id,
    });

    return await this.repo.save(driver);
  }

  async remove(id: string) {
    const driver = await this.repo.findOne({ where: { id } });

    if (!driver) {
      throw new NotFoundException(`Driver with ID ${id} not found`);
    }

    // hard delete
    return await this.repo.remove(driver);
  }
}
