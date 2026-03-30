import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Driver } from './entities/driver.entity';
import { DriverController } from './driver.controller';
import { DriverService } from './driver.service';
import { OpService } from '../../../common/service/op.service';
import { FileServiceProvider } from '../../../common/service/file.service';
import { OptimizeImageService } from '../../../common/service/optimize-image.service';
import { ImgFileService } from '../../../common/service/imgfile.service';

@Module({
  imports: [TypeOrmModule.forFeature([Driver])],
  controllers: [DriverController],
  providers: [
    DriverService,
    OpService,
    FileServiceProvider,
    ImgFileService,
    OptimizeImageService,
  ],
})
export class DriverModule {}
