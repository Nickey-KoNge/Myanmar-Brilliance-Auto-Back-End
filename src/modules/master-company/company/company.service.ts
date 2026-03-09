import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Company } from './entities/company.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private companyRepo: Repository<Company>,
  ) {}

  create(dto: CreateCompanyDto) {
    const company = this.companyRepo.create(dto);
    return this.companyRepo.save(company);
  }

  findAll() {
    return this.companyRepo.find();
  }

  findOne(id: string) {
    return this.companyRepo.findOne({ where: { id } });
  }

  async update(id: string, dto: UpdateCompanyDto) {
    await this.companyRepo.update(id, dto);
    return this.findOne(id);
  }

  remove(id: string) {
    return this.companyRepo.delete(id);
  }
}