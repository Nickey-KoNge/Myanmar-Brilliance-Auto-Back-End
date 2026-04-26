import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TripFinanceService } from './trip-finance.service';
import { TripFinanceController } from './trip-finance.controller';
import { TripFinance } from './entities/trip-finance.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TripFinance])],
  controllers: [TripFinanceController],
  providers: [TripFinanceService],
  exports: [TripFinanceService],
})
export class TripFinanceModule {}
