import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './entities/company.entity';
import { CreateCompanyDto } from './dto/create-company.dto';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
  ) {}

  async create(createCompanyDto: CreateCompanyDto) {
    try {
      const company = this.companyRepository.create(createCompanyDto);
      return await this.companyRepository.save(company);
    } catch (error) {
      // Handle unique constraint violations for reg_number, phone, or email
      if (error.code === '23505') {
        throw new ConflictException('Company with this Registration, Phone, or Email already exists');
      }
      throw error;
    }
  }
}