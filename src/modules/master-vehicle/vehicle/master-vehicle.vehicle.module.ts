import { Module } from '@nestjs/common';
import { MasterVehicleService } from './master-vehicle.vehicle.service';
import { MasterVehicleController } from './master-vehicle.vehicle.controller';
import { Vehicle } from './entities/vehicle.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OpService } from 'src/common/service/op.service';
import { OptimizeImageService } from 'src/common/service/optimize-image.service';
import { FileServiceProvider } from 'src/common/service/file.service';
import { MasterAuditModule } from 'src/modules/master-audit/audit/audit.module';

@Module({
  imports: [TypeOrmModule.forFeature([Vehicle]), MasterAuditModule],
  controllers: [MasterVehicleController],
  providers: [
    MasterVehicleService,
    FileServiceProvider,
    OptimizeImageService,
    OpService,
  ],
})
export class MasterVehicleModule {}
