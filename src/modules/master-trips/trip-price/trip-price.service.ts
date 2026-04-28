import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { TripPrice } from './entities/trip-price.entity';
import { CreateTripPriceDto } from './dtos/create-trip-price.dto';
import { UpdateTripPriceDto } from './dtos/update-trip-price.dto';
import { PaginateTripPriceDto } from './dtos/paginate-trip-price.dto';
import { start } from 'repl';

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

  async findAll(query: PaginateTripPriceDto) {
    const {
      limit = 10,
      page = 1,
      search,
      route_id,
      vehicle_model_id,
      station_id,
      status,
    } = query;
    const queryBuilder = this.tpRepo
      .createQueryBuilder('trip_price')
      .leftJoinAndSelect('trip_price.route', 'route')
      .leftJoinAndSelect(
        'trip_price.vehicle_model_relation',
        'vehicle_model_relation',
      )
      .leftJoinAndSelect('trip_price.station_relation', 'station_relation');

    if (status) {
      queryBuilder.andWhere('trip_price.status = :status', { status });
    }
    if (search && search.trim() !== '') {
      queryBuilder.andWhere(
        `route.route_name ILIKE :search 
         OR vehicle_model_relation.vehicle_model_name ILIKE :search 
         OR station_relation.station_name ILIKE :search`,
        { search: `%${search}%` },
      );
    }
    if (route_id) {
      queryBuilder.andWhere('trip_price.route_id = :route_id', { route_id });
    }
    if (vehicle_model_id) {
      queryBuilder.andWhere('trip_price.vehicle_model_id = :vehicle_model_id', {
        vehicle_model_id,
      });
    }
    if (station_id) {
      queryBuilder.andWhere('trip_price.station_id = :station_id', {
        station_id,
      });
    }

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip);

    const rawData = await queryBuilder
      .orderBy('trip_price.created_at', 'DESC')
      .addOrderBy('trip_price.id', 'DESC')
      .take(limit)
      .getMany();

    const data = rawData.map((tp) => ({
      id: tp.id,
      route: tp.route,
      vehicle_model_relation: tp.vehicle_model_relation,
      station_relation: tp.station_relation,
      daily_trip_rate: tp.daily_trip_rate,
      overnight_trip_rate: tp.overnight_trip_rate,
      status: tp.status,
      created_at: tp.created_at,
      updated_at: tp.updated_at,
    }));

    const hasFilters = !!(
      search ||
      route_id ||
      vehicle_model_id ||
      station_id ||
      status
    );
    const total = await this.getOptimizedCount(queryBuilder, hasFilters);

    return {
      data,
      total,
      totalPages: Math.ceil(total / limit) || 1,
      currentPage: page,
    };
  }

  private async getOptimizedCount(
    queryBuilder: SelectQueryBuilder<TripPrice>,
    hasFilters: boolean,
  ): Promise<number> {
    if (hasFilters) {
      return await queryBuilder.getCount();
    }
    try {
      const result = await this.tpRepo.query<{ estimate: string }[]>(
        `
          SELECT reltuples::bigint AS estimate FROM pg_class c 
          JOIN pg_namespace n ON n.oid = c.relnamespace
          WHERE n.nspname = 'master_trips' AND c.relname = 'trip_prices';
        `,
      );
      const estimate = result[0]?.estimate ? Number(result[0].estimate) : 0;
      return estimate < 1000 ? await this.tpRepo.count() : estimate;
    } catch {
      return await this.tpRepo.count();
    }
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

  async update(id: string, dto: UpdateTripPriceDto) {
    return await this.tpRepo.update(id, dto);
  }

  async remove(id: string): Promise<void> {
    const record = await this.findOne(id);
    await this.tpRepo.remove(record);
  }
}
