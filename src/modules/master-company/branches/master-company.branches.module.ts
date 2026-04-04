//src/modules/master-company/branches/master-company.branches.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Branches } from './entities/branches.entity';
import { MasterCompanyBranchesController } from './master-company.branches.controller';
import { MasterCompanyBranchesService } from './master-company.branches.service';
import { OpService } from 'src/common/service/op.service';
import { ImgFileService } from 'src/common/service/imgfile.service';
import { MasterAuditModule } from 'src/modules/master-audit/audit/audit.module';
@Module({
  imports: [TypeOrmModule.forFeature([Branches]), MasterAuditModule],
  controllers: [MasterCompanyBranchesController],
  providers: [MasterCompanyBranchesService, OpService, ImgFileService],
})
export class MasterCompanyBranchesModule {}
