//src/modules/master-audit/audit/audit.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Audit } from './entities/audit.entity';
import { MasterAuditController } from './audit.controller';
import { MasterAuditService } from './audit.service';
import { OpService } from 'src/common/service/op.service';
import { AuditGateway } from './audit.gateway';
// import { ImgFileService } from 'src/common/service/imgfile.service';

@Module({
  imports: [TypeOrmModule.forFeature([Audit])],
  controllers: [MasterAuditController],
  providers: [MasterAuditService, OpService, AuditGateway],
  exports: [MasterAuditService],
})
export class MasterAuditModule {}
