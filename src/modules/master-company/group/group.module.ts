import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from './entities/group.entity';
import { GroupController } from './group.controller';
import { GroupService } from './group.service';
import { OpService } from '../../../common/service/op.service';
import { MasterAuditModule } from '../../master-audit/audit/audit.module';

@Module({
  imports: [TypeOrmModule.forFeature([Group]), MasterAuditModule],
  controllers: [GroupController],
  providers: [GroupService, OpService],
})
export class GroupModule {}
