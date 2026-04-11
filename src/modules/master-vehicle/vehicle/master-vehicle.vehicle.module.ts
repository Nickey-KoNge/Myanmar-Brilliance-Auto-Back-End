import { Module } from "@nestjs/common";
import { MasterVehicleService } from "./master-vehicle.vehicle.service";
import { MasterVehicleController } from "./master-vehicle.vehicle.controller";
import { Type } from "class-transformer";
import { Vehicle } from "./entities/vehicle.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OpService } from "src/common/service/op.service";
import { OptimizeImageService } from "src/common/service/optimize-image.service";
import { FileServiceProvider } from "src/common/service/file.service";


@Module({
    imports:[TypeOrmModule.forFeature([Vehicle])],
    controllers:[MasterVehicleController],
    providers:[MasterVehicleService,FileServiceProvider,OptimizeImageService,OpService],
})

export class MasterVehicleModule{}