import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RentalOperation } from '../master-rental/rental-operation/entities/rental-operation.entity';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';

@Module({
  imports: [TypeOrmModule.forFeature([RentalOperation])],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}
