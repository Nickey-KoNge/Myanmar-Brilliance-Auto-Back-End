import { Module } from '@nestjs/common';
import { StaffService } from './staff.service';
import { StaffController } from './staff.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Staff } from './entities/staff.entity';
import { Credential } from '../credential/entities/credential.entity';
import { MasterCredentialModule } from '../credential/credential.module';
import { FileServiceProvider } from 'src/common/service/file.service';
import { OptimizeImageService } from 'src/common/service/optimize-image.service';
import { AtStrategy } from 'src/common/strategies/at.strategy';
import { MasterAuditModule } from 'src/modules/master-audit/audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Staff, Credential]),
    MasterCredentialModule,
    MasterAuditModule,
  ],
  controllers: [StaffController],
  providers: [
    StaffService,
    FileServiceProvider,
    OptimizeImageService,
    AtStrategy,
  ],
  exports: [StaffService],
})
export class MasterStaffModule {}
