import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere } from 'typeorm';
import { TripFinance } from './entities/trip-finance.entity';
import { CreateTripFinanceDto } from './dtos/create-trip-finance.dto';
import { PaginateTripFinanceDto } from './dtos/paginate-trip-finance.dto';

@Injectable()
export class TripFinanceService {
  constructor(
    @InjectRepository(TripFinance)
    private readonly tripFinanceRepository: Repository<TripFinance>,
  ) {}

  async create(createDto: CreateTripFinanceDto): Promise<TripFinance> {
    const newFinance = this.tripFinanceRepository.create(createDto);
    return await this.tripFinanceRepository.save(newFinance);
  }

  async findAll(query: PaginateTripFinanceDto): Promise<{
    data: TripFinance[];
    total: number;
    page: number;
    lastPage: number;
  }> {
    const {
      page = 1,
      limit = 10,
      trip_id,
      staff_id,
      payment_status,
      status,
      startDate,
      endDate,
    } = query;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<TripFinance> = {};

    if (trip_id) where.trip_id = trip_id;
    if (staff_id) where.staff_id = staff_id;
    if (payment_status) where.payment_status = payment_status;
    if (status) where.status = status;

    if (startDate && endDate) {
      where.receive_date = Between(new Date(startDate), new Date(endDate));
    }

    const [data, total] = await this.tripFinanceRepository.findAndCount({
      where,
      relations: ['trip_operation', 'staff'],
      order: { created_at: 'DESC' },
      take: limit,
      skip: skip,
    });

    return {
      data,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<TripFinance> {
    const record = await this.tripFinanceRepository.findOne({
      where: { id },
      relations: ['trip_operation', 'staff'],
    });
    if (!record)
      throw new NotFoundException(`Trip Finance with ID ${id} not found`);
    return record;
  }

  async remove(id: string): Promise<void> {
    const result = await this.tripFinanceRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Trip Finance with ID ${id} not found`);
    }
  }
}
