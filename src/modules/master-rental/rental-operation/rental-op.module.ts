import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RentalOperation } from './entities/rental-operation.entity';
import { RentalOpController } from './rental-op.controller';
import { RentalOpService } from './rental-op.service';
import { OpService } from 'src/common/service/op.service';
import { MasterAuditModule } from 'src/modules/master-audit/audit/audit.module';
import { VehicleDriverAssign } from 'src/modules/master-vehicle/driver-assign/entities/vehicle-driver-assign.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([RentalOperation, VehicleDriverAssign]),
    MasterAuditModule,
  ],
  controllers: [RentalOpController],
  providers: [RentalOpService, OpService],
})
export class RentalOperationModule {}
