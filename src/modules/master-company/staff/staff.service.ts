import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Staff } from './entities/staff.entity';
import { Repository } from 'typeorm';
import { CredentialsService } from '../credential/credential.service';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,
    private readonly credentialService: CredentialsService,
  ) {}

  async create(createStaffDto: CreateStaffDto) {
    const credential = await this.credentialService.register({
      email: createStaffDto.email,
      password: createStaffDto.password,
    });

    const staff = this.staffRepository.create({
      staffName: createStaffDto.staffName,
      phone: createStaffDto.phone,
      position: createStaffDto.position,
      credential: { id: credential.id },
      company: { id: createStaffDto.company },
    });

    return this.staffRepository.save(staff);
  }

  findAll() {
    return this.staffRepository.find({ relations: ['company', 'credential'] });
  }

  async findOne(id: string) {
    const staff = await this.staffRepository.findOne({
      where: { id },
      relations: ['company', 'credential'],
    });

    if (!staff) {
      throw new NotFoundException('Staff not found');
    }

    return staff;
  }

  async update(id: string, updateStaffDto: UpdateStaffDto) {
    const staff = await this.staffRepository.findOne({
      where: { id },
      relations: ['credential', 'company'],
    });

    if (!staff) throw new NotFoundException('Staff not found');

    staff.staffName = updateStaffDto.staffName ?? staff.staffName;
    staff.phone = updateStaffDto.phone ?? staff.phone;
    staff.position = updateStaffDto.position ?? staff.position;
    staff.status = updateStaffDto.status ?? staff.status;

    if (updateStaffDto.company) {
      staff.company = { id: updateStaffDto.company } as any;
    }

    if ((updateStaffDto.email || updateStaffDto.password) && staff.credential) {
      await this.credentialService.updateCredential(
        staff.credential.id,
        updateStaffDto.email,
        updateStaffDto.password,
      );
    }

    await this.staffRepository.save(staff);

    const updatedStaff = await this.staffRepository.findOne({
      where: { id },
      relations: ['credential', 'company'],
    });

    return updatedStaff;
  }

  async remove(id: string) {
    const staff = await this.staffRepository.findOne({
      where: { id },
      relations: ['credential'],
    });

    if (!staff) {
      throw new NotFoundException('Staff not found');
    }

    if (staff.credential) {
      await this.credentialService.deleteCredential(staff.credential.id);
    }

    await this.staffRepository.delete(id);

    return { message: 'Staff deleted successfully' };
  }
}
