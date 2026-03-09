//src/modules/master-company/branches/master-company.branches.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BranchesEntity } from './entities/branches.entity';
import { MasterCompanyBranchesController } from './master-company.branches.controller';
import { MasterCompanyBranchesService } from './master-company.branches.service';

@Module({
  imports: [TypeOrmModule.forFeature([BranchesEntity])],
  controllers: [MasterCompanyBranchesController],
    providers: [MasterCompanyBranchesService]   
})
export class MasterCompanyBranchesModule {}
