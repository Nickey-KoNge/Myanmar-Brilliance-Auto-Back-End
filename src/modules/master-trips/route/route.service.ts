import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Route } from './entities/route.entity';
import { CreateRouteDto } from './dtos/create-route.dto';
import { UpdateRouteDto } from './dtos/update-route.dto';

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

  async findAll() {
    const items = await this.routeRepo.find({
      where: { status: 'Active' },
      order: { created_at: 'DESC' },
    });

    return { items };
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
