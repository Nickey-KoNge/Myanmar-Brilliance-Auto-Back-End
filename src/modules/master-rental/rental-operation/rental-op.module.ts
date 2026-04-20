import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RentalOperation } from './entities/rental-operation.entity';
import { RentalOpController } from './rental-op.controller';
import { RentalOpService } from './rental-op.service';
import { OpService } from 'src/common/service/op.service';
import { MasterAuditModule } from 'src/modules/master-audit/audit/audit.module';
import { VehicleDriverAssign } from 'src/modules/master-vehicle/driver-assign/entities/vehicle-driver-assign.entity';
import { TripFinanceModule } from '../trip-finance/trip-finance.module';
import { TripFinance } from '../trip-finance/entities/trip-finance.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RentalOperation,
      VehicleDriverAssign,
      TripFinance,
    ]),
    MasterAuditModule,
    TripFinanceModule,
  ],
  controllers: [RentalOpController],
  providers: [RentalOpService, OpService],
})
export class RentalOperationModule {}
