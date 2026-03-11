import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { Company } from './entities/company.entity';
import { CreateCompanyDto } from './dtos/create-company.dto';
import { UpdateCompanyDto } from './dtos/update-company.dto';
import { IFileService } from '../../../common/service/i-file.service';
import { OpService } from '../../../common/service/op.service';
import { OptimizeImageService } from '../../../common/service/optimize-image.service';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private companyRepo: Repository<Company>,

    @Inject(IFileService)
    private readonly fileService: IFileService,
    private readonly opService: OpService,
    private readonly optimizeImageService: OptimizeImageService,
  ) {}

  async findActive(limit: number = 100): Promise<Company[]> {
    return await this.companyRepo.find({
      where: { status: 'Active' },
      select: ['id', 'company_name'],
      take: limit,
    });
  }

  async findByIds(ids: string[]): Promise<Company[]> {
    if (!ids || ids.length === 0) return [];
    return await this.companyRepo.find({
      where: { id: In(ids) },
    });
  }
  
  async create(
    createCompanyDto: CreateCompanyDto,
    file: Express.Multer.File,
  ): Promise<Company> {
    if (!file) throw new Error('No file uploaded');
    const existingCompany = await this.companyRepo.findOne({
      where: [
        { reg_number: createCompanyDto.reg_number },
        { email: createCompanyDto.email },
      ],
    });
    if (existingCompany) {
      const message =
        existingCompany.reg_number === createCompanyDto.reg_number
          ? 'Company Registration Number already exists'
          : 'Company Email already exists';
      throw new ConflictException(message);
    }
    const optimizedFile = await this.optimizeImageService.optimizeImage(file);
    const imageUrl = await this.fileService.uploadFile(
      optimizedFile,
      'company',
    );
    try {
      return await this.opService.create<Company>(this.companyRepo, {
        ...createCompanyDto,
        image: imageUrl,
      });
    } catch (error) {
      throw new BadRequestException(
        `Registration not Success! ${error}, Re-check Company Registration Information.`,
      );
    }
  }

  findAll() {
    return this.companyRepo.find();
  }

  async findOne(id: string): Promise<Company> {
    const company = await this.companyRepo.findOne({
      where: { id },
      relations: ['branches'],
      select: {
        id: true,
        company_name: true,
        reg_number: true,
        street_address: true,
        city: true,
        phone: true,
        owner_name: true,
        website_url: true,
        establish_year: true,
        reg_exp_date: true,
        image: true,
        email: true,
        branches: {
          id: true,
          branches_name: true,
        },
      },
    });
    if (!company)
      throw new NotFoundException(`Company with ID ${id} not found`);
    return company;
  }

  async update(
    id: string,
    updateCompanyDto: UpdateCompanyDto,
    file?: Express.Multer.File,
  ): Promise<Company> {
    const dto = { ...updateCompanyDto };

    if (Object.keys(dto).length === 0 && !file) {
      throw new Error('No data provided for update');
    }

    if (file) {
      const existingCompany = await this.findOne(id);

      const [optimizedFile] = await Promise.all([
        this.optimizeImageService.optimizeImage(file),
        existingCompany.image
          ? this.fileService.deleteFile(existingCompany.image)
          : Promise.resolve(),
      ]);

      dto.image = await this.fileService.uploadFile(optimizedFile, 'company');
    }

    return await this.opService.update<Company>(this.companyRepo, id, dto);
  }

  async remove(id: string): Promise<Company> {
    const existingCompany = await this.findOne(id);
    if (existingCompany?.image) {
      await this.fileService.deleteFile(existingCompany.image);
    }
    return await this.opService.remove<Company>(this.companyRepo, id);
  }
}
