import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, FindOptionsWhere } from 'typeorm';
import { Driver } from './entities/driver.entity';
import { OpService } from '../../../common/service/op.service';
import { IFileService } from '../../../common/service/i-file.service';
import { CreateDriverDto } from './dtos/create-driver.dto';
import { UpdateDriverDto } from './dtos/update-driver.dto';
import { MasterAuditService } from 'src/modules/master-audit/audit/audit.service';
import { getChanges } from 'src/common/utils/object.util';
import { CredentialsService } from '../credential/credential.service';
import { PaginateDriverDto } from './dtos/paginate-driver.dto';

@Injectable()
export class DriverService {
  constructor(
    @InjectRepository(Driver) private readonly repo: Repository<Driver>,
    private readonly opService: OpService,
    @Inject(IFileService) private readonly fileService: IFileService,
    private readonly auditService: MasterAuditService,
    private readonly credentialService: CredentialsService,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(query: PaginateDriverDto) {
    const {
      page = 1,
      limit = 10,
      search,
      lastId,
      lastCreatedAt,
      station_id: stationId,
      startDate,
      endDate,
    } = query;
    const skip = (Number(page) - 1) * Number(limit);

    const queryBuilder = this.repo.createQueryBuilder('driver');

    queryBuilder
      .leftJoinAndSelect('driver.credential_id', 'credential')
      .leftJoinAndSelect('driver.stations', 'stations');

    if (search) {
      queryBuilder.andWhere(
        `(driver.driver_name ILike :search 
          OR driver.phone ILike :search 
          OR driver.address ILike :search
          OR driver.city ILike :search
          OR driver.country ILike :search
          OR driver.nrc ILike :search
          OR driver.license_no ILike :search 
          OR driver.deposits ILike :search 
          OR driver.license_type ILike :search 
          OR driver.driving_exp ILike :search 
          OR CAST(driver.dob AS TEXT) ILike :search 
          OR CAST(driver.join_date AS TEXT) ILike :search 
          OR credential.email ILike :search)`,
        { search: `%${search}%` },
      );
    }

    if (stationId) {
      queryBuilder.andWhere('driver.station_id = :stationId', { stationId });
    }

    if (startDate || endDate) {
      if (startDate)
        queryBuilder.andWhere('driver.createdAt >= :startDate', {
          startDate: `${startDate} 00:00:00`,
        });
      if (endDate)
        queryBuilder.andWhere('driver.createdAt <= :endDate', {
          endDate: `${endDate} 23:59:59`,
        });
    }

    if (lastId && lastCreatedAt && lastId !== 'undefined') {
      queryBuilder.andWhere(
        '(driver.createdAt < :lastCreatedAt OR (driver.createdAt = :lastCreatedAt AND driver.id < :lastId))',
        { lastCreatedAt, lastId },
      );
    } else {
      queryBuilder.skip(skip);
    }

    queryBuilder.take(Number(limit)).orderBy('driver.createdAt', 'DESC');

    const [items, total] = await queryBuilder.getManyAndCount();

    const activeCount = await this.repo.count({ where: { status: 'Active' } });
    const inactiveCount = await this.repo.count({
      where: { status: 'Inactive' },
    });

    const stationsList = await this.repo.manager.query<
      { id: string; name: string }[]
    >(
      `SELECT id, station_name as name FROM "master_company"."stations" ORDER BY station_name ASC`,
    );

    const formattedItems = items.map((item) => {
      const addr = item.address ?? '';
      const city = item.city ?? '';
      const country = item.country ?? '';

      const cred = item.credential_id as unknown as {
        id?: string;
        email?: string;
      };

      return {
        id: item.id,
        driver_name: item.driver_name,
        phone: item.phone,
        nrc: item.nrc,
        license_no: item.license_no,
        license_type: item.license_type,
        license_expiry: item.license_expiry,
        driving_exp: item.driving_exp,
        deposits: item.deposits,
        join_date: item.join_date,
        gender: item.gender,
        address: item.address,
        city: item.city,
        country: item.country,
        image: item.image,
        dob: item.dob,
        status: item.status,
        createdAt: item.createdAt,

        station_id: item.station_id,
        station_name: item.stations?.station_name ?? null,

        credential_id: cred?.id ?? null,
        credential_email: cred?.email ?? null,

        fullAddress: `${addr} ${city} ${country}`.trim() || null,
      };
    });

    let lastEditedBy = 'Unknown';
    try {
      const lastAudit = await this.repo.query<{ performed_by: string }[]>(
        `SELECT performed_by FROM master_audit.audit WHERE entity_name = 'driver' ORDER BY created_at DESC LIMIT 1`,
      );
      if (lastAudit && lastAudit.length > 0) {
        lastEditedBy = lastAudit[0].performed_by;
      }
    } catch (auditError) {
      console.log('Error fetching last audit:', auditError);
    }

    return {
      items: formattedItems,
      stations: stationsList,
      meta: {
        totalItems: total,
        itemCount: items.length,
        itemsPerPage: Number(limit),
        totalPages: Math.ceil(total / Number(limit)) || 1,
        currentPage: Number(page),
        activeItems: activeCount,
        inactiveItems: inactiveCount,
        lastEditedBy,
      },
    };
  }

  async findOne(id: string): Promise<Driver> {
    const driver = await this.repo.findOne({
      where: { id } as unknown as FindOptionsWhere<Driver>,
      relations: ['credential_id'],
    });

    if (!driver) {
      throw new NotFoundException(`Driver with ID ${id} not found`);
    }

    return driver;
  }

  async createDriver(
    dto: CreateDriverDto,
    userId: string,
    file?: Express.Multer.File,
  ): Promise<Driver> {
    const { email, password, station_id, ...driverData } = dto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let imageUrl: string | undefined;

    try {
      const credential = await this.credentialService.register(
        { email, password },
        queryRunner.manager,
      );

      if (file) {
        imageUrl = await this.fileService.uploadFile(file, 'drivers');
      }

      const newDriver = queryRunner.manager.create(Driver, {
        ...driverData,
        image: imageUrl,
        credential_id: credential.id,
        station_id: station_id || null,
      });

      const savedDriver = await queryRunner.manager.save(newDriver);

      await queryRunner.commitTransaction();

      // Audit Log (CREATE)
      await this.auditService.logAction(
        'driver',
        savedDriver.id,
        'CREATE',
        null,
        { ...dto, image: imageUrl },
        userId,
      );

      return savedDriver;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (imageUrl) {
        await this.fileService.deleteFile(imageUrl).catch((err) => {
          console.warn('Failed to rollback image upload:', err);
        });
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      throw new BadRequestException(`Registration failed! ${errorMessage}`);
    } finally {
      await queryRunner.release();
    }
  }
  async update(
    id: string,
    dto: UpdateDriverDto,
    userId: string,
    file?: Express.Multer.File,
  ): Promise<Driver> {
    const driver = await this.repo.findOne({
      where: { id } as FindOptionsWhere<Driver>,
      relations: ['stations', 'credential_id'],
    });

    if (!driver) {
      throw new NotFoundException(`Driver with ID ${id} not found`);
    }

    const credential = driver.credential_id as unknown as {
      id: string;
      email: string;
    };

    const oldState: Record<string, unknown> = {
      ...driver,
      email: credential?.email || null,
      station_id: driver.station_id || null,
    };

    const { email, password, station_id, ...driverData } = dto;

    if ((email || password) && credential) {
      const credId =
        typeof driver.credential_id === 'string'
          ? driver.credential_id
          : credential.id;

      await this.credentialService.updateCredential(credId, email, password);
    }

    let oldImageToDelete: string | null = null;
    if (file) {
      if (driver.image) {
        oldImageToDelete = driver.image;
      }
      driver.image = await this.fileService.uploadFile(file, 'drivers');
    }

    Object.assign(driver, driverData);

    if (station_id !== undefined) {
      driver.station_id = station_id;
    }

    const updatedDriver = await this.repo.save(driver);

    if (oldImageToDelete) {
      await this.fileService.deleteFile(oldImageToDelete).catch((err) => {
        console.warn(`Failed to delete old driver image:`, err);
      });
    }

    const cleanOldState = JSON.parse(JSON.stringify(oldState)) as Record<
      string,
      unknown
    >;
    const cleanNewState = JSON.parse(JSON.stringify(dto)) as Record<
      string,
      unknown
    >;

    if (driver.image) cleanNewState.image = driver.image;

    const { oldVals, newVals } = getChanges(cleanOldState, cleanNewState);

    if (newVals.password) {
      newVals.password = '***CHANGED***';
    }

    if (Object.keys(newVals).length > 0) {
      await this.auditService.logAction(
        'driver',
        id,
        'UPDATE',
        oldVals,
        newVals,
        userId,
      );
    }

    return updatedDriver;
  }

  async remove(id: string, userId: string): Promise<{ id: string }> {
    const driverToDelete = await this.findOne(id);
    const oldState = { ...driverToDelete };

    try {
      await this.repo.remove(driverToDelete);

      const credObj = driverToDelete.credential_id as unknown as {
        id?: string;
      };
      const targetCredentialId =
        typeof driverToDelete.credential_id === 'string'
          ? driverToDelete.credential_id
          : credObj?.id;

      if (targetCredentialId) {
        await this.credentialService.deleteCredential(targetCredentialId);
      }

      if (driverToDelete.image) {
        await this.fileService.deleteFile(driverToDelete.image).catch((err) => {
          console.warn(`Failed to delete driver image for ID ${id}:`, err);
        });
      }

      const cleanOldState = JSON.parse(JSON.stringify(oldState)) as Record<
        string,
        unknown
      >;
      await this.auditService.logAction(
        'driver',
        id,
        'DELETE',
        cleanOldState,
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
          'Cannot delete this driver because they are assigned to active records.',
        );
      }
      throw error;
    }
  }

  async restoreDriver(auditId: string, userId: string): Promise<Driver> {
    const auditRecord = await this.auditService.findOne(auditId);

    if (auditRecord.entity_name !== 'driver') {
      throw new BadRequestException('This audit record is not for drivers');
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
      unknown
    >;

    // မလိုအပ်သော Timestamp များကို ဖြုတ်ပါ
    delete dataToRestore['deleted_at'];
    delete dataToRestore['deletedAt'];
    delete dataToRestore['updated_at'];
    delete dataToRestore['updatedAt'];

    // 🛑 Email ကို dataToRestore မှသော်လည်းကောင်း၊ credential_id object အတွင်းမှသော်လည်းကောင်း ရှာဖွေပါ
    let driverEmail = dataToRestore['email'] as string | undefined;
    if (!driverEmail && dataToRestore['credential_id']) {
      const credObj = dataToRestore['credential_id'] as Record<string, unknown>;
      if (credObj && typeof credObj === 'object' && 'email' in credObj) {
        driverEmail = credObj.email as string | undefined;
      }
    }

    if (
      dataToRestore['stations'] &&
      typeof dataToRestore['stations'] === 'object'
    ) {
      const stationObj = dataToRestore['stations'] as Record<string, unknown>;
      if (stationObj.id) {
        dataToRestore['station_id'] = stationObj.id;
      }
      delete dataToRestore['stations'];
    }
    const existingDriver = await this.repo.findOne({
      where: {
        id: auditRecord.entity_id,
      } as unknown as FindOptionsWhere<Driver>,
      withDeleted: true,
      relations: ['credential_id'],
    });

    const toPlainObject = (data: unknown): Record<string, unknown> => {
      return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
    };

    const beforeState =
      existingDriver !== null
        ? toPlainObject(existingDriver)
        : { status: 'Permanently Deleted / Not Exists' };

    let restoredDriver: Driver;

    try {
      if (auditRecord.action === 'DELETE') {
        if (driverEmail) {
          const credService = this.credentialService as unknown as Record<
            string,
            (email: string) => Promise<{ id: string }>
          >;
          if (typeof credService.restoreCredential === 'function') {
            const recoveredCred =
              await credService.restoreCredential(driverEmail);
            dataToRestore['credential_id'] = recoveredCred.id;
          }
        }
        delete dataToRestore['email'];
      } else if (auditRecord.action === 'UPDATE') {
        if (driverEmail && existingDriver) {
          const existingCred = existingDriver.credential_id as unknown as {
            id: string;
          };
          if (existingCred?.id) {
            await this.credentialService.updateCredential(
              existingCred.id,
              driverEmail,
            );
          }
        }
        delete dataToRestore['email'];

        // credential_id သည် Object အဖြစ် ကျန်ခဲ့ပါက ID ပြန်ပြောင်းပေးပါ
        if (
          'credential_id' in dataToRestore &&
          typeof dataToRestore['credential_id'] === 'object'
        ) {
          const credObj = dataToRestore['credential_id'] as Record<
            string,
            unknown
          >;
          dataToRestore['credential_id'] = credObj.id;
        }
      }

      if (existingDriver) {
        if ('deletedAt' in existingDriver) {
          (existingDriver as Driver & { deletedAt?: Date | null }).deletedAt =
            null;
        }

        Object.assign(existingDriver, dataToRestore);
        restoredDriver = await this.repo.save(existingDriver);
      } else {
        const newDriver = this.repo.create(dataToRestore);
        Object.assign(newDriver, { id: auditRecord.entity_id });
        restoredDriver = await this.repo.save(newDriver);
      }

      const afterState = {
        id: restoredDriver.id,
        ...dataToRestore,
      };

      await this.auditService.logAction(
        'driver',
        restoredDriver.id,
        'RESTORE',
        beforeState,
        afterState,
        userId,
      );

      return restoredDriver;
    } catch (error: unknown) {
      console.error('Restore Error:', error);
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as Record<string, unknown>).code === '23503'
      ) {
        throw new BadRequestException(
          'Cannot restore driver because the associated Station or Credential has been permanently deleted.',
        );
      }
      throw new InternalServerErrorException(
        'Failed to restore driver due to database constraints.',
      );
    }
  }
}
