// src/common/service/op.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import {
  Repository,
  DeepPartial,
  FindOptionsWhere,
  ObjectLiteral,
} from 'typeorm';
import { ImgFileService } from './imgfile.service';

@Injectable()
export class OpService {
  constructor(private readonly imgFileService: ImgFileService) {}

  /**
   * Create a new record
   */
  async create<T extends ObjectLiteral>(
    repository: Repository<T>,
    dto: DeepPartial<T>,
  ): Promise<T> {
    const entity = repository.create(dto);
    return await repository.save(entity);
  }

  async update<T extends ObjectLiteral>(
    repository: Repository<T>,
    id: string,
    dto: DeepPartial<T>,
  ): Promise<T> {
    const entity = await repository.findOne({
      where: { id } as unknown as FindOptionsWhere<T>,
    });

    if (!entity)
      throw new NotFoundException(`${repository.metadata.name} not found`);

    Object.assign(entity, dto);

    return await repository.save(entity);
  }
  async remove<T extends ObjectLiteral>(
    repository: Repository<T>,
    id: string,
  ): Promise<T> {
    const data = await repository.findOne({
      where: { id } as unknown as FindOptionsWhere<T>,
    });
    if (!data) throw new NotFoundException('Record not found');

    // Call the separate image service
    if ('image' in data && typeof data['image'] === 'string') {
      await this.imgFileService.deleteFile(data['image']);
    }

    return await repository.remove(data);
  }
}
