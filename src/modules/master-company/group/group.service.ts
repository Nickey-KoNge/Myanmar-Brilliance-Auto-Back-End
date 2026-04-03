import { Injectable, NotFoundException } from '@nestjs/common';
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

  // ✅ CREATE
  async create(dto: CreateGroupDto) {
    const group = this.repo.create(dto);
    return await this.repo.save(group);
  }

  // ✅ GET ALL (with pagination + filter)
  async findAll(query: any) {
    const { search, fromDate, toDate, page = 1, limit = 10 } = query;

    const qb = this.repo.createQueryBuilder('group');

    if (search) {
      qb.andWhere(
        '(group.group_name ILIKE :search OR group.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (fromDate && toDate) {
      qb.andWhere('group.createdAt BETWEEN :fromDate AND :toDate', {
        fromDate,
        toDate,
      });
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
        currentPage: page,
      },
    };
  }

  // ✅ GET ONE (🔥 YOU WERE MISSING THIS)
  async findOne(id: string) {
    const group = await this.repo.findOne({ where: { id } });

    if (!group) {
      throw new NotFoundException(`Group not found`);
    }

    return group;
  }

  // ✅ UPDATE
  async update(id: string, dto: UpdateGroupDto) {
    const group = await this.findOne(id);

    Object.assign(group, dto);

    return await this.repo.save(group);
  }

  // ✅ DELETE
  async remove(id: string) {
    const group = await this.findOne(id);

    await this.repo.remove(group);

    return { message: 'Deleted successfully' };
  }
}