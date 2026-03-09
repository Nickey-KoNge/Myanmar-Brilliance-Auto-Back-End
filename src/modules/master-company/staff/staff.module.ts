import { Module } from '@nestjs/common';
import { StaffService } from './staff.service';
import { StaffController } from './staff.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Staff } from './entities/staff.entity';
import { Credential } from '../credential/entities/credential.entity';
import { CredentialModule } from '../credential/credential.module';

@Module({
  imports: [TypeOrmModule.forFeature([Staff,Credential]), CredentialModule],
  controllers: [StaffController],
  providers: [StaffService],
  exports: [StaffService]
})
export class StaffModule {}
