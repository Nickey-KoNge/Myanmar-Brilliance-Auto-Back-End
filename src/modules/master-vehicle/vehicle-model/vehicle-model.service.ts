import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VehicleModels } from './entities/vehicle-model.entity';
import { CreateVehicleModelDto } from './dtos/create-vehicle-model.dto';
import { UpdateVehicleModelDto } from './dtos/update-vehicle-model.dto';

@Injectable()
export class VehicleModelService {
  constructor(
    @InjectRepository(VehicleModels)
    private readonly repo: Repository<VehicleModels>,
  ) {}

  async create(dto: CreateVehicleModelDto) {
    const model = this.repo.create(dto);
    return await this.repo.save(model);
  }

  async findAll(query: any) {
    const { page = 1, limit = 10, search = '' } = query;
    return await this.repo.find({
      take: limit,
      skip: (page - 1) * limit,
      relations: ['vehicle_brand'],
    });
  }

  async findOne(id: string) {
    const model = await this.repo.findOne({
      where: { id },
      relations: ['vehicle_brand'],
    });
    if (!model) throw new NotFoundException('Vehicle Model not found');
    return model;
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
