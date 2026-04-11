import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from './entities/group.entity';
import { CreateGroupDto } from './dtos/create-group.dto';
import { UpdateGroupDto } from './dtos/update-group.dto';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group)
    private readonly repo: Repository<Group>,
  ) {}

 
  async create(dto: CreateGroupDto) {
    try {
      const group = this.repo.create(dto);
      return await this.repo.save(group);
    } catch (error) {
      console.error('Create Error:', error);
      throw new InternalServerErrorException('Failed to create group');
    }
  }


  async findAll(query: any) {
    const { search, fromDate, toDate, page = 1, limit = 10 } = query;
    const qb = this.repo.createQueryBuilder('group');

    if (search) {
      qb.andWhere('(group.group_name ILIKE :search OR group.description ILIKE :search)', {
        search: `%${search}%`,
      });
    }

    if (fromDate && toDate) {
      qb.andWhere('group.createdAt BETWEEN :fromDate AND :toDate', { fromDate, toDate });
    }

    qb.skip((page - 1) * limit)
      .take(limit)
      .orderBy('group.createdAt', 'DESC');

    const [items, total] = await qb.getManyAndCount();

    return {
      items,
      meta: {
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        currentPage: Number(page),
      },
    };
  }

  
  async findOne(id: string) {
    const group = await this.repo.findOne({ where: { id } });
    if (!group) throw new NotFoundException(`Group with ID ${id} not found`);
    return group;
  }


  async update(id: string, dto: UpdateGroupDto) {
    const group = await this.findOne(id);
    Object.assign(group, dto);
    try {
      return await this.repo.save(group);
    } catch (error) {
      throw new InternalServerErrorException('Update failed');
    }
  }


  async remove(id: string) {
    const group = await this.findOne(id);
    await this.repo.remove(group);
    return { id };
  }
}