// src/modules/master-company/branches/master-company.branches.service.ts

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Branches } from './entities/branches.entity';
// import { Create } from 'sharp';
import { CreateBranchesDto } from './dtos/create-branches.dto';
import { UpdateBranchesDto } from './dtos/update-branches.dto';
import { OpService } from '../../../common/service/op.service';
import { PaginateBranchesDto } from './dtos/paginate-branches.dto';

@Injectable()
export class MasterCompanyBranchesService {
  constructor(
    private readonly opService: OpService,

    @InjectRepository(Branches)
    private readonly branchesRepository: Repository<Branches>,
  ) {}

  async create(dto: CreateBranchesDto): Promise<Branches> {
    return await this.opService.create<Branches>(this.branchesRepository, dto);
  }

  async findAll(query: PaginateBranchesDto) {
    const {
      limit,
      page,
      lastId,
      lastCreatedAt,
      search,
      startDate,
      endDate,
      company_id: companyId,
    } = query;

    const queryBuilder = this.branchesRepository.createQueryBuilder('branches');

    queryBuilder.leftJoinAndSelect('branches.company', 'company');

    if (companyId) {
      queryBuilder.andWhere('branches.company = :companyId', { companyId });
    }
    // 1. Dynamic Filters (Search & Date Range)
    if (search) {
      queryBuilder.andWhere(
        `(branches.branches_name ILike :search 
          OR branches.description ILike :search 
          OR branches.phone ILike :search
          OR branches.address ILike :search
          OR branches.city ILike :search
          OR branches.division ILike :search)`,
        { search: `%${search}%` },
      );
    }

    if (startDate || endDate) {
      if (startDate)
        queryBuilder.andWhere('branches.created_at >= :startDate', {
          startDate: `${startDate} 00:00:00`,
        });
      if (endDate)
        queryBuilder.andWhere('branches.created_at <= :endDate', {
          endDate: `${endDate} 23:59:59`,
        });
    }

    if (lastId && lastCreatedAt && lastId !== 'undefined') {
      queryBuilder.andWhere(
        '(branches.created_at < :lastCreatedAt OR (branches.created_at = :lastCreatedAt AND branches.id < :lastId))',
        { lastCreatedAt, lastId },
      );
    } else {
      const skip = (page - 1) * limit;
      queryBuilder.skip(skip);
    }

    const rawData = await queryBuilder
      .orderBy('branches.created_at', 'DESC')
      .addOrderBy('branches.id', 'DESC')
      .take(limit)
      .getMany();

    const data = rawData.map((branch) => ({
      id: branch.id,
      branches_name: branch.branches_name,
      gps_location: branch.gps_location,
      description: branch.description,
      phone: branch.phone,
      city: branch.city,
      division: branch.division,
      address: branch.address,
      company_id: branch.company?.id || null,
      company_name: branch.company?.company_name || null,
      status: branch.status,
    }));

    const hasFilters = !!(search || startDate || endDate || companyId);
    const total = await this.getOptimizedCount(queryBuilder, hasFilters);

    return {
      data,
      total,
      totalPages: Math.ceil(total / limit) || 1,
      currentPage: page,
    };
  }
  private async getOptimizedCount(
    queryBuilder: SelectQueryBuilder<Branches>,
    hasFilters: boolean,
  ): Promise<number> {
    if (hasFilters) {
      return await queryBuilder.getCount();
    }

    try {
      const result = await this.branchesRepository.query<
        { estimate: string }[]
      >(
        `SELECT reltuples::bigint AS estimate FROM pg_class c 
         JOIN pg_namespace n ON n.oid = c.relnamespace 
         WHERE n.nspname = 'master_company' AND c.relname = 'branches'`, // Schema name ကို သတိထားပါ
      );

      const estimate = result?.[0]?.estimate ? Number(result[0].estimate) : 0;
      return estimate < 1000 ? await this.branchesRepository.count() : estimate;
    } catch {
      return await this.branchesRepository.count();
    }
  }
  async findOne(id: string): Promise<Branches> {
    const branch = await this.branchesRepository.findOne({
      where: { id },
      relations: { company: true, staff: true, stations: true },
      select: {
        id: true,
        branches_name: true,
        gps_location: true,
        description: true,
        phone: true,
        city: true,
        address: true,
        division: true,
        status: true,
        company: { id: true },
      },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }
    return branch;
  }

  async update(id: string, dto: UpdateBranchesDto): Promise<Branches> {
    return await this.opService.update<Branches>(
      this.branchesRepository,
      id,
      dto,
    );
  }

  async remove(id: string): Promise<{ id: string }> {
    await this.findOne(id);

    try {
      await this.opService.remove<Branches>(this.branchesRepository, id);

      return { id };
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as Record<string, unknown>).code === '23503'
      ) {
        throw new BadRequestException(
          'Cannot delete this branch because it contains active staff or stations. Please remove or reassign them first.',
        );
      }

      throw error;
    }
  }
}
