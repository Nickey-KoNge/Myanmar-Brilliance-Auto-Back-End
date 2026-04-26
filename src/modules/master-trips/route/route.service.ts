import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Route } from './entities/route.entity';
import { CreateRouteDto } from './dtos/create-route.dto';
import { UpdateRouteDto } from './dtos/update-route.dto';
import { PaginateRouteDto } from './dtos/paginate-route.dto';

@Injectable()
export class RouteService {
  constructor(
    @InjectRepository(Route)
    private readonly routeRepo: Repository<Route>,
  ) {}

  async create(createRouteDto: CreateRouteDto): Promise<Route> {
    const newRoute = this.routeRepo.create(createRouteDto);
    return await this.routeRepo.save(newRoute);
  }

  async findAll(query:PaginateRouteDto) {
    // const items = await this.routeRepo.find({
    //   where: { status: 'Active' },
    //   order: { created_at: 'DESC' },
    // });

    // return { items };
    const { limit, page, lastId, lastCreatedAt, search,startDate,endDate} = query;

    const queryBuilder=this.routeRepo.createQueryBuilder('route');

    if (search && search.trim() !== "") {
  queryBuilder.andWhere(
    `route.route_name ILIKE :search 
     OR route.start_location ILIKE :search
     OR route.end_location ILIKE :search`,
    { search: `%${search}%` }
  );
}
    if(startDate && endDate){
      if(startDate)queryBuilder.andWhere(`route.created_at >= :startDate`, { startDate });
      if(endDate)queryBuilder.andWhere(`route.created_at <= :endDate`, { endDate });
    }

    if (lastId && lastCreatedAt) {
      queryBuilder.andWhere(
        `(route.created_at < :lastCreatedAt OR (route.created_at = :lastCreatedAt AND route.id < :lastId))`,
        { lastCreatedAt, lastId },
      );
    }else {
      const skip=(page - 1) * limit;
      queryBuilder.skip(skip);
    }


    const rawData=await queryBuilder
    .orderBy('route.created_at', 'DESC')
    .addOrderBy('route.id', 'DESC')
    .take(limit)
    .getMany();


    const data=rawData.map(route=>({
      id: route.id,
      route_name: route.route_name,
      start_location: route.start_location,
      end_location: route.end_location,
      status: route.status,
      created_at: route.created_at,
      updated_at: route.updated_at
    }));

    const hasFilters=!!(search || startDate || endDate);
    const total=await this.getOptimizedCount(queryBuilder, hasFilters);

    return {
      data,
      total,
      totalPages: Math.ceil(total / limit) || 1,
      currentPage: page,
    }
  }

  private async getOptimizedCount(
      queryBuilder: SelectQueryBuilder<Route>,
      hasFilters: boolean,
    ): Promise<number> {
      if (hasFilters) {
        return await queryBuilder.getCount();
      }
  
      try {
        const result = await this.routeRepo.query<
          { estimate: string }[]
        >(
          `
                  SELECT reltuples::bigint AS estimate FROM pg_class c 
                  JOIN pg_namespace n ON n.oid = c.relnamespace
                  WHERE n.nspname = 'master_trips' AND c.relname = 'routes';
                  `,
        );
  
        const estimate = result[0]?.estimate ? Number(result[0].estimate) : 0;
        return estimate < 1000
          ? await this.routeRepo.count()
          : estimate;
      } catch {
        return await this.routeRepo.count();
      }
    }



  async findOne(id: string): Promise<Route> {
    const route = await this.routeRepo.findOne({ where: { id } });
    if (!route) {
      throw new NotFoundException(`Route with ID ${id} not found`);
    }
    return route;
  }

  async update(id: string, updateRouteDto: UpdateRouteDto): Promise<Route> {
    const route = await this.findOne(id);
    Object.assign(route, updateRouteDto);
    return await this.routeRepo.save(route);
  }

  async remove(id: string): Promise<void> {
    const route = await this.findOne(id);
    await this.routeRepo.remove(route);
  }
}
