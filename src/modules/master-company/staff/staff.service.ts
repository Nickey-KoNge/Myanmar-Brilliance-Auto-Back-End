import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Staff } from './entities/staff.entity';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { CredentialsService } from '../credential/credential.service';
import { IFileService } from 'src/common/service/i-file.service';
import { OptimizeImageService } from 'src/common/service/optimize-image.service';
import { OpService } from 'src/common/service/op.service';

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
  ) {}

  async create(
    createStaffDto: CreateStaffDto,
    file: Express.Multer.File,
  ): Promise<Staff> {
    let imageUrl: string | undefined;

    const { email, password, company, branch, role, ...staffData } =
      createStaffDto;

    const credential = await this.credentialService.register({
      email,
      password,
    });

    if (file) {
      const optimizedFile = await this.optimizeImageService.optimizeImage(file);
      imageUrl = await this.fileService.uploadFile(optimizedFile, 'staff');
    }

    const staff = this.staffRepository.create({
      ...staffData,
      image: imageUrl,
      credential: { id: credential.id },
      company: { id: company },
      branch: { id: branch },
      role: { id: role },
    });

    try {
      return await this.opService.create<Staff>(this.staffRepository, {
        ...staff,
      });
    } catch (error) {
      throw new BadRequestException(
        `Registration not Success! ${error}, Re-check Staff Registration Information.`,
      );
    }
  }

  async findAll(): Promise<Staff[]> {
    return this.staffRepository.find({
      relations: {
        company: true,
        credential: true,
        branch: true,
        role: true,
      },
    });
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
    });

    if (!staff) {
      throw new NotFoundException(`Staff not found`);
    }

    return staff;
  }

  async update(
    id: string,
    updateStaffDto: UpdateStaffDto,
    file?: Express.Multer.File,
  ): Promise<Staff> {
    const staff = await this.findOne(id);

    const { email, password, company, branch, role, ...staffData } =
      updateStaffDto;

    if (!staff) {
      throw new NotFoundException('Staff not found');
    }

    Object.assign(staff, staffData);

    if (company) {
      staff.company = { id: company } as Staff['company'];
    }

    if (branch) {
      staff.branch = { id: branch } as Staff['branch'];
    }

    if (role) {
      staff.role = { id: role } as Staff['role'];
    }

    if (file) {
      if (staff.image) {
        await this.fileService.deleteFile(staff.image);
      }

      const optimizedFile = await this.optimizeImageService.optimizeImage(file);
      staff.image = await this.fileService.uploadFile(optimizedFile, 'staff');
    }

    if ((email || password) && staff.credential) {
      await this.credentialService.updateCredential(
        staff.credential.id,
        email,
        password,
      );
    }

    return await this.opService.update<Staff>(this.staffRepository, id, staff);
  }

  async remove(id: string): Promise<Staff> {
    const staff = await this.staffRepository.findOne({
      where: { id },
      relations: ['credential'],
    });

    if (!staff) {
      throw new NotFoundException('Staff not found');
    }

    if (staff.image) {
      await this.fileService.deleteFile(staff.image);
    }

    if (staff.credential) {
      await this.credentialService.deleteCredential(staff.credential.id);
    }

    return await this.opService.remove<Staff>(this.staffRepository, id);
  }
}
