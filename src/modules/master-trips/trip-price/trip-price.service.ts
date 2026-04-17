import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TripPrice } from './entities/trip-price.entity';
import { CreateTripPriceDto } from './dtos/create-trip-price.dto';
import { UpdateTripPriceDto } from './dtos/update-trip-price.dto';

@Injectable()
export class TripPriceService {
  constructor(
    @InjectRepository(TripPrice)
    private readonly tpRepo: Repository<TripPrice>,
  ) {}

  async create(dto: CreateTripPriceDto): Promise<TripPrice> {
    const newRecord = this.tpRepo.create(dto);
    return await this.tpRepo.save(newRecord);
  }

  async findAll() {
    const items = await this.tpRepo.find({
      where: { status: 'Active' },
      relations: ['route', 'vehicle_model_relation', 'station_relation'],
      order: { created_at: 'DESC' },
    });
    return { items };
  }

  async findOne(id: string): Promise<TripPrice> {
    const record = await this.tpRepo.findOne({
      where: { id },
      relations: ['route', 'vehicle_model_relation', 'station_relation'],
    });
    if (!record) {
      throw new NotFoundException(`Trip Price with ID ${id} not found`);
    }
    return record;
  }

  async update(id: string, dto: UpdateTripPriceDto): Promise<TripPrice> {
    const record = await this.findOne(id);
    Object.assign(record, dto);
    return await this.tpRepo.save(record);
  }

  async remove(id: string): Promise<void> {
    const record = await this.findOne(id);
    await this.tpRepo.remove(record);
  }
}
