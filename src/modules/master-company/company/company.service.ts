import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, SelectQueryBuilder } from 'typeorm';

import { Company } from './entities/company.entity';
import { CreateCompanyDto } from './dtos/create-company.dto';
import { UpdateCompanyDto } from './dtos/update-company.dto';
import { IFileService } from '../../../common/service/i-file.service';
import { OpService } from '../../../common/service/op.service';
import { OptimizeImageService } from '../../../common/service/optimize-image.service';
import { PaginateCompanyDto } from './dtos/paginate-company.dto';
import { MasterAuditService } from 'src/modules/master-audit/audit/audit.service';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private companyRepo: Repository<Company>,

    @Inject(IFileService)
    private readonly fileService: IFileService,
    private readonly opService: OpService,
    private readonly optimizeImageService: OptimizeImageService,
    private readonly auditService: MasterAuditService,
  ) {}

  private getChanges(
    oldObj: Record<string, unknown>,
    newObj: Record<string, unknown>,
  ): { oldVals: Record<string, unknown>; newVals: Record<string, unknown> } {
    const oldVals: Record<string, unknown> = {};
    const newVals: Record<string, unknown> = {};

    Object.keys(newObj).forEach((key) => {
      if (oldObj[key] !== newObj[key] && newObj[key] !== undefined) {
        oldVals[key] = oldObj[key];
        newVals[key] = newObj[key];
      }
    });

    return { oldVals, newVals };
  }

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
    userId: string,
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
      const newCompany = await this.opService.create<Company>(
        this.companyRepo,
        {
          ...createCompanyDto,
          image: imageUrl,
        },
      );

      await this.auditService.logAction(
        'company',
        newCompany.id,
        'CREATE',
        null,
        { ...createCompanyDto },
        userId,
      );
      return newCompany;
    } catch (error) {
      throw new BadRequestException(
        `Registration not Success! ${error}, Re-check Company Registration Information.`,
      );
    }
  }

  async findAll(query: PaginateCompanyDto) {
    const { page, limit, search, lastId, lastCreatedAt, startDate, endDate } =
      query;
    const queryBuilder = this.companyRepo.createQueryBuilder('company');
    if (search) {
      queryBuilder.andWhere(
        `(company.company_name ILike :search 
          OR company.reg_number ILike :search 
          OR company.phone ILike :search
          OR company.street_address ILike :search
          OR company.city ILike :search
          OR company.country ILike :search
          OR company.owner_name ILike :search
          OR company.owner_email ILike :search
          OR company.owner_phone ILike :search
          OR company.email ILike :search)`,
        { search: `%${search}%` },
      );
    }

    if (startDate || endDate) {
      if (startDate)
        queryBuilder.andWhere('company.created_at >= :startDate', {
          startDate: `${startDate} 00:00:00`,
        });
      if (endDate)
        queryBuilder.andWhere('company.created_at <= :endDate', {
          endDate: `${endDate} 23:59:59`,
        });
    }

    if (lastId && lastCreatedAt && lastId !== 'undefined') {
      queryBuilder.andWhere(
        '(company.created_at < :lastCreatedAt OR (company.created_at = :lastCreatedAt AND company.id < :lastId))',
        { lastCreatedAt, lastId },
      );
    } else {
      const skip = (page - 1) * limit;
      queryBuilder.skip(skip);
    }

    const rawData = await queryBuilder
      .orderBy('company.created_at', 'DESC')
      .addOrderBy('company.id', 'DESC')
      .take(limit)
      .getMany();

    const data = rawData.map((company) => ({
      id: company.id,
      company_name: company.company_name,
      reg_number: company.reg_number,
      street_address: company.street_address,
      city: company.city,
      phone: company.phone,
      owner_name: company.owner_name,
      owner_email: company.owner_email,
      owner_phone: company.owner_phone,
      website_url: company.website_url,
      establish_year: company.establish_year,
      reg_exp_date: company.reg_exp_date,
      image: company.image,
      email: company.email,
      country: company.country,
      status: company.status,
    }));

    const hasFilters = !!(search || startDate || endDate);
    const total = await this.getOptimizedCount(queryBuilder, hasFilters);

    return {
      data,
      total,
      totalPages: Math.ceil(total / limit) || 1,
      currentPage: page,
    };
  }
  private async getOptimizedCount(
    queryBuilder: SelectQueryBuilder<Company>,
    hasFilters: boolean,
  ): Promise<number> {
    if (hasFilters) {
      return await queryBuilder.getCount();
    }

    try {
      const result = await this.companyRepo.query<{ estimate: string }[]>(
        `SELECT reltuples::bigint AS estimate FROM pg_class c 
           JOIN pg_namespace n ON n.oid = c.relnamespace 
           WHERE n.nspname = 'master_company' AND c.relname = 'company'`,
      );

      const estimate = result?.[0]?.estimate ? Number(result[0].estimate) : 0;
      return estimate < 1000 ? await this.companyRepo.count() : estimate;
    } catch {
      return await this.companyRepo.count();
    }
  }
  async findOne(id: string): Promise<Company> {
    const company = await this.companyRepo.findOne({
      where: { id },
      relations: {
        branches: true,
      },
      select: {
        id: true,
        company_name: true,
        reg_number: true,
        street_address: true,
        city: true,
        country: true,
        phone: true,
        owner_name: true,
        owner_email: true,
        owner_phone: true,
        website_url: true,
        establish_year: true,
        reg_exp_date: true,
        image: true,
        email: true,
        status: true,
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
    userId: string,
    file?: Express.Multer.File,
  ): Promise<Company> {
    const oldCompany = await this.findOne(id);
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

    const updatedCompany = await this.opService.update<Company>(
      this.companyRepo,
      id,
      dto,
    );
    const { oldVals, newVals } = this.getChanges(
      oldCompany as unknown as Record<string, unknown>,
      dto as unknown as Record<string, unknown>,
    );

    if (Object.keys(newVals).length > 0) {
      await this.auditService.logAction(
        'company',
        id,
        'UPDATE',
        oldVals,
        newVals,
        userId,
      );
    }

    return updatedCompany;
  }

  async remove(id: string, userId: string): Promise<{ id: string }> {
    const existingCompany = await this.findOne(id);
    if (existingCompany?.image) {
      await this.fileService.deleteFile(existingCompany.image);
    }
    try {
      await this.opService.remove<Company>(this.companyRepo, id);

      await this.auditService.logAction(
        'company',
        id,
        'DELETE',
        { ...existingCompany },
        null,
        userId,
      );

      return { id };
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as Record<string, unknown>).code === '23503'
      ) {
        throw new BadRequestException(
          'Cannot delete this company because it contains active staff or stations. Please remove or reassign them first.',
        );
      }
      throw error;
    }

    // return await this.opService.remove<Company>(this.companyRepo, id);
  }
  async restoreCompany(auditId: string, userId: string): Promise<Company> {
    // ၁။ Audit record ကို ရှာပါ
    const auditRecord = await this.auditService.findOne(auditId);

    if (auditRecord.entity_name !== 'company') {
      throw new BadRequestException('This audit record is not for company');
    }

    const dataToRestore = auditRecord.old_values;

    if (!dataToRestore) {
      throw new BadRequestException(
        'No old data available to restore from this action',
      );
    }

    // ၃။ Database ထဲတွင် ရှိမရှိ စစ်ဆေးပါ
    const existingCompany = await this.companyRepo.findOne({
      where: { id: auditRecord.entity_id },
      withDeleted: true,
    });

    if (existingCompany) {
      Object.assign(existingCompany, dataToRestore);
      const restored = await this.companyRepo.save(existingCompany);

      // Audit ပြန်မှတ်မည်
      await this.auditService.logAction(
        'company',
        restored.id,
        'RESTORE',
        null,
        null,
        userId,
      );
      return restored;
    } else {
      const newCompany = this.companyRepo.create(dataToRestore);
      const restored = await this.companyRepo.save(newCompany);

      await this.auditService.logAction(
        'company',
        restored.id,
        'RESTORE',
        null,
        null,
        userId,
      );
      return restored;
    }
  }
}
