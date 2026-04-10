import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, SelectQueryBuilder } from 'typeorm';
import { Staff } from './entities/staff.entity';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { CredentialsService } from '../credential/credential.service';
import { IFileService } from 'src/common/service/i-file.service';
import { OptimizeImageService } from 'src/common/service/optimize-image.service';
import { OpService } from 'src/common/service/op.service';
import { PaginateStaffDto } from './dto/paginate-staff.dto';
import { MasterAuditService } from 'src/modules/master-audit/audit/audit.service';
import { getChanges } from '../../../common/utils/object.util';
import 'multer';
import { Company } from '../company/entities/company.entity';
import { Role } from 'src/modules/master-service/role/entities/role.entity';
import { Branches } from '../branches/entities/branches.entity';
@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,
    private readonly credentialService: CredentialsService,
    private readonly dataSource: DataSource,

    @Inject(IFileService)
    private readonly fileService: IFileService,
    private readonly opService: OpService,
    private readonly optimizeImageService: OptimizeImageService,
    private readonly auditService: MasterAuditService,
  ) {}

  async create(
    createStaffDto: CreateStaffDto,
    userId: string,
    file: Express.Multer.File,
  ): Promise<Staff> {
    const { email, password, company, branch, role, ...staffData } =
      createStaffDto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let imageUrl: string | undefined;

    try {
      const credential = await this.credentialService.register(
        {
          email,
          password,
        },
        queryRunner.manager,
      );

      if (file) {
        const optimizedFile =
          await this.optimizeImageService.optimizeImage(file);
        imageUrl = await this.fileService.uploadFile(optimizedFile, 'staff');
      }

      const staff = queryRunner.manager.create(Staff, {
        ...staffData,
        image: imageUrl,
        credential: { id: credential.id },
        company: { id: company },
        branch: { id: branch },
        role: { id: role },
      });

      const savedStaff = await queryRunner.manager.save(staff);

      await queryRunner.commitTransaction();
      await this.auditService.logAction(
        'staff',
        staff.id,
        'CREATE',
        null,
        { ...createStaffDto },
        userId,
      );
      return savedStaff;
    } catch (error) {
      await queryRunner.rollbackTransaction();

      if (imageUrl) {
        await this.fileService.deleteFile(imageUrl);
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      throw new BadRequestException(
        `Registration failed! ${errorMessage}. All changes rolled back.`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(query: PaginateStaffDto) {
    const {
      page,
      limit,
      search,
      lastId,
      lastCreatedAt,
      company_id: companyId,
      branches_id: branchesId,
      role_id: roleId,
      startDate,
      endDate,
    } = query;

    const queryBuilder = this.staffRepository.createQueryBuilder('staff');
    queryBuilder
      .leftJoinAndSelect('staff.credential', 'credential')
      .leftJoinAndSelect('staff.company', 'company')
      .leftJoinAndSelect('staff.branch', 'branch')
      .leftJoinAndSelect('staff.role', 'role');

    // 3. Select လုပ်တဲ့အခါ ID တွေရော Name တွေပါ အတိအကျ ဆွဲထုတ်မယ်
    queryBuilder.addSelect([
      'company.id',
      'company.company_name',
      'branch.id',
      'branch.branches_name',
      'role.id',
      'role.role_name',
    ]);

    if (companyId) {
      queryBuilder.andWhere('staff.company = :companyId', { companyId });
    }
    if (branchesId) {
      queryBuilder.andWhere('staff.branch = :branchesId', { branchesId });
    }
    if (roleId) {
      queryBuilder.andWhere('staff.role = :roleId', { roleId });
    }
    if (search) {
      queryBuilder.andWhere(
        `(staff.staff_name ILike :search 
          OR staff.position ILike :search 
          OR staff.phone ILike :search
          OR staff.street_address ILike :search
          OR staff.city ILike :search
          OR staff.country ILike :search
           OR staff.nrc ILike :search
          OR CAST(staff.dob AS TEXT) ILike :search)`,
        { search: `%${search}%` },
      );
    }

    if (startDate || endDate) {
      if (startDate)
        queryBuilder.andWhere('staff.createdAt >= :startDate', {
          startDate: `${startDate} 00:00:00`,
        });
      if (endDate)
        queryBuilder.andWhere('staff.createdAt <= :endDate', {
          endDate: `${endDate} 23:59:59`,
        });
    }

    if (lastId && lastCreatedAt && lastId !== 'undefined') {
      queryBuilder.andWhere(
        '(staff.createdAt < :lastCreatedAt OR (staff.createdAt = :lastCreatedAt AND staff.id < :lastId))',
        { lastCreatedAt, lastId },
      );
    } else {
      const skip = (page - 1) * limit;
      queryBuilder.skip(skip);
    }

    const rawData = await queryBuilder
      .orderBy('staff.createdAt', 'DESC')
      .addOrderBy('staff.id', 'DESC')
      .take(limit)
      .getMany();
    const data = rawData.map((staff) => ({
      id: staff.id,
      staffName: staff.staffName,
      phone: staff.phone,
      nrc: staff.nrc,
      position: staff.position,
      image: staff.image,
      street_address: staff.street_address,
      city: staff.city,
      country: staff.country,
      email: staff.credential?.email || null,
      status: staff.status,
      company_id: staff.company?.id || null,
      company_name: staff.company?.company_name || null,

      branches_id: staff.branch?.id || null,
      branches_name: staff.branch?.branches_name || null,

      role_id: staff.role?.id || null,
      role_name: staff.role?.role_name || null,
    }));

    const hasFilters = !!(search || startDate || endDate || companyId);
    const total = await this.getOptimizedCount(queryBuilder, hasFilters);

    //active and inactive count
    const activeCount = await this.staffRepository.count({
      where: { status: 'Active' },
    });
    const inactiveCount = total - activeCount > 0 ? total - activeCount : 0;

    let lastEditedBy = 'Unknown';
    try {
      const lastAudit = await this.staffRepository.query<
        { performed_by: string }[]
      >(
        `SELECT performed_by FROM master_audit.audit WHERE entity_name = 'staff' ORDER BY created_at DESC LIMIT 1`,
      );
      if (lastAudit && lastAudit.length > 0) {
        lastEditedBy = lastAudit[0].performed_by;
      }
    } catch (error) {
      console.log('Error fetching last audit:', error);
    }

    return {
      data,
      total,
      totalPages: Math.ceil(total / limit) || 1,
      currentPage: page,
      activeCount,
      inactiveCount,
      lastEditedBy,
    };
  }

  private async getOptimizedCount(
    queryBuilder: SelectQueryBuilder<Staff>,
    hasFilters: boolean,
  ): Promise<number> {
    if (hasFilters) {
      return await queryBuilder.getCount();
    }

    try {
      const result = await this.staffRepository.query<{ estimate: string }[]>(
        `SELECT reltuples::bigint AS estimate FROM pg_class c 
           JOIN pg_namespace n ON n.oid = c.relnamespace 
           WHERE n.nspname = 'master_company' AND c.relname = 'staff'`, // Schema name ကို သတိထားပါ
      );

      const estimate = result?.[0]?.estimate ? Number(result[0].estimate) : 0;
      return estimate < 1000 ? await this.staffRepository.count() : estimate;
    } catch {
      return await this.staffRepository.count();
    }
  }

  async findOne(id: string): Promise<Staff> {
    const staff = await this.staffRepository.findOne({
      where: { id },
      relations: {
        company: true,
        credential: true,
        branch: true,
        role: true,
      },
      select: {
        id: true,
        staffName: true,
        phone: true,
        nrc: true,
        position: true,
        image: true,
        status: true,
        city: true,
        country: true,
        street_address: true,
        dob: true,
        gender: true,
        credential: {
          id: true,
          email: true,
        },
        company: {
          id: true,
          company_name: true,
        },
        branch: {
          id: true,
          branches_name: true,
        },
        role: {
          id: true,
          role_name: true,
        },
      },
    });

    if (!staff) {
      throw new NotFoundException(`Staff not found`);
    }

    return staff;
  }

  // async update(
  //   id: string,
  //   updateStaffDto: UpdateStaffDto,
  //   userId: string,
  //   file?: Express.Multer.File,
  // ): Promise<Staff> {
  //   const staff = await this.staffRepository.findOne({
  //     where: { id },
  //     relations: ['credential', 'company', 'branch', 'role'],
  //   });
  //   if (!staff) {
  //     throw new NotFoundException('Staff not found');
  //   }

  //   const oldState = {
  //     ...staff,
  //     email: staff.credential?.email,
  //     company: staff.company?.id,
  //     branch: staff.branch?.id,
  //     role: staff.role?.id,
  //   };

  //   const { email, password, company, branch, role, ...staffData } =
  //     updateStaffDto;

  //   if ((email || password) && staff.credential) {
  //     await this.credentialService.updateCredential(
  //       staff.credential.id,
  //       email,
  //       password,
  //     );
  //   }
  //   Object.assign(staff, staffData);

  //   if (company) staff.company = { id: company } as Staff['company'];
  //   if (branch) staff.branch = { id: branch } as Staff['branch'];
  //   if (role) staff.role = { id: role } as Staff['role'];

  //   const newState: Record<string, any> = { ...updateStaffDto };

  //   let oldImageToDelete: string | null = null;

  //   if (file) {
  //     if (staff.image) {
  //       oldImageToDelete = staff.image;
  //     }
  //     const optimizedFile = await this.optimizeImageService.optimizeImage(file);
  //     staff.image = await this.fileService.uploadFile(optimizedFile, 'staff');
  //     newState.image = staff.image;
  //   }

  //   const updatedStaff = await this.opService.update<Staff>(
  //     this.staffRepository,
  //     id,
  //     staff,
  //   );

  //   if (oldImageToDelete) {
  //     await this.fileService.deleteFile(oldImageToDelete).catch((err) => {
  //       console.warn(`Failed to delete old staff image:`, err);
  //     });
  //   }

  //   const { oldVals, newVals } = getChanges(
  //     oldState as unknown as Record<string, unknown>,
  //     newState as unknown as Record<string, unknown>,
  //   );

  //   if (newVals.password) {
  //     newVals.password = '***CHANGED***';
  //   }

  //   if (Object.keys(newVals).length > 0) {
  //     await this.auditService.logAction(
  //       'staff',
  //       id,
  //       'UPDATE',
  //       oldVals,
  //       newVals,
  //       userId,
  //     );
  //   }

  //   return updatedStaff;
  // }
  async update(
    id: string,
    updateStaffDto: UpdateStaffDto,
    userId: string,
    file?: Express.Multer.File, // 💡 အောက်တွင် ရှင်းပြချက်ကို ဖတ်ပါ
  ): Promise<Staff> {
    const staff = await this.staffRepository.findOne({
      where: { id },
      relations: ['credential', 'company', 'branch', 'role'],
    });

    if (!staff) {
      throw new NotFoundException('Staff not found');
    }

    const oldState: Record<string, unknown> = {
      ...staff,
      email: staff.credential?.email || null,
      company: staff.company?.id || null,
      branch: staff.branch?.id || null,
      role: staff.role?.id || null,
    };
    delete oldState.credential;

    const { email, password, company, branch, role, ...staffData } =
      updateStaffDto;

    if ((email || password) && staff.credential) {
      await this.credentialService.updateCredential(
        staff.credential.id,
        email,
        password,
      );
    }

    Object.assign(staff, staffData);

    if (company !== undefined)
      staff.company = (company ? { id: company } : null) as unknown as Company;
    if (branch !== undefined)
      staff.branch = (branch ? { id: branch } : null) as unknown as Branches;
    if (role !== undefined)
      staff.role = (role ? { id: role } : null) as unknown as Role;

    const newState: Record<string, unknown> = { ...updateStaffDto };

    let oldImageToDelete: string | null = null;

    if (file) {
      if (staff.image) {
        oldImageToDelete = staff.image;
      }
      const optimizedFile = await this.optimizeImageService.optimizeImage(file);
      staff.image = await this.fileService.uploadFile(optimizedFile, 'staff');
      newState.image = staff.image;
    }

    const updatedStaff = await this.opService.update<Staff>(
      this.staffRepository,
      id,
      staff,
    );

    if (oldImageToDelete) {
      await this.fileService.deleteFile(oldImageToDelete).catch((err) => {
        console.warn(`Failed to delete old staff image:`, err);
      });
    }

    // 🛑 ESLint Unsafe Assignment Error များကို ရှင်းလင်းရန် 'as Record<string, unknown>' ဖြင့် ကြေညာပေးပါသည်
    const cleanOldState = JSON.parse(JSON.stringify(oldState)) as Record<
      string,
      unknown
    >;
    const cleanNewState = JSON.parse(JSON.stringify(newState)) as Record<
      string,
      unknown
    >;

    const { oldVals, newVals } = getChanges(cleanOldState, cleanNewState);

    if (newVals.password) {
      newVals.password = '***CHANGED***';
    }

    if (Object.keys(newVals).length > 0) {
      await this.auditService.logAction(
        'staff',
        id,
        'UPDATE',
        oldVals,
        newVals,
        userId,
      );
    }

    return updatedStaff;
  }
  async remove(id: string, userId: string): Promise<Staff> {
    const staff = await this.staffRepository.findOne({
      where: { id },
      relations: ['credential', 'company', 'branch', 'role'],
    });

    if (!staff) {
      throw new NotFoundException('Staff not found');
    }

    const oldState: Record<string, unknown> = {
      ...staff,
      email: staff.credential?.email || null,
      company: staff.company?.id || null,
      branch: staff.branch?.id || null,
      role: staff.role?.id || null,
      credential: staff.credential?.id || null,
    };

    const credentialId = staff.credential?.id;

    const deletedStaff = await this.opService.remove<Staff>(
      this.staffRepository,
      id,
    );

    if (credentialId) {
      await this.credentialService.deleteCredential(credentialId);
    }
    if (staff.image) {
      await this.fileService.deleteFile(staff.image).catch((err) => {
        console.warn(`Failed to delete staff image:`, err);
      });
    }
    await this.auditService.logAction(
      'staff',
      id,
      'DELETE',
      oldState,
      null,
      userId,
    );
    return deletedStaff;
  }
  async restoreStaff(auditId: string, userId: string): Promise<Staff> {
    const auditRecord = await this.auditService.findOne(auditId);

    if (auditRecord.entity_name !== 'staff') {
      throw new BadRequestException('This audit record is not for staff');
    }

    const rawOldValues = (
      typeof auditRecord.old_values === 'string'
        ? JSON.parse(auditRecord.old_values)
        : auditRecord.old_values
    ) as Record<string, unknown> | null;

    if (!rawOldValues || Object.keys(rawOldValues).length === 0) {
      throw new BadRequestException(
        'No old data available to restore from this action',
      );
    }

    const dataToRestore = JSON.parse(JSON.stringify(rawOldValues)) as Record<
      string,
      any
    >;
    delete dataToRestore['deleted_at'];
    delete dataToRestore['deletedAt'];
    delete dataToRestore['updated_at'];
    delete dataToRestore['updatedAt'];

    const relationKeys = ['company', 'branch', 'role'];
    relationKeys.forEach((key) => {
      if (
        dataToRestore[key] !== undefined &&
        typeof dataToRestore[key] === 'string'
      ) {
        dataToRestore[key] = { id: dataToRestore[key] } as unknown;
      }
    });

    const existingStaff = await this.staffRepository.findOne({
      where: { id: auditRecord.entity_id },
      withDeleted: true,
    });

    let restoredStaff: Staff;

    try {
      let recoveredCredentialId: string | null = null;

      const staffEmail =
        (dataToRestore['email'] as string | undefined) ||
        `restored_${Date.now()}@example.com`;

      const credService = this.credentialService as unknown as Record<
        string,
        (email: string) => Promise<{ id: string }>
      >;

      if (typeof credService['restoreCredential'] === 'function') {
        const recoveredCred =
          await credService['restoreCredential'](staffEmail);
        recoveredCredentialId = recoveredCred.id;
      }

      if (recoveredCredentialId) {
        dataToRestore['credential'] = { id: recoveredCredentialId } as unknown;
      }

      if (existingStaff) {
        if ('deletedAt' in existingStaff) {
          (existingStaff as Staff & { deletedAt?: Date | null }).deletedAt =
            null;
        }

        this.staffRepository.merge(existingStaff, dataToRestore);
        restoredStaff = await this.staffRepository.save(existingStaff);
      } else {
        const newStaff = this.staffRepository.create(dataToRestore);
        newStaff.id = auditRecord.entity_id;
        restoredStaff = await this.staffRepository.save(newStaff);
      }

      await this.auditService.logAction(
        'staff',
        restoredStaff.id,
        'RESTORE',
        null,
        { ...restoredStaff },
        userId,
      );

      return restoredStaff;
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as Record<string, unknown>).code === '23503'
      ) {
        throw new BadRequestException(
          'Cannot restore staff because the associated Company, Branch, or Role has been permanently deleted.',
        );
      }
      throw error;
    }
  }
}
