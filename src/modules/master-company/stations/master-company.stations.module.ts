import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Stations } from "./entities/stations.entity";
import { MasterCompanyStationsController } from "./master-company.stations.controller";
import { MasterCompanyStationsService } from "./master-company.stations.service";
import { OpService } from "src/common/service/op.service";
import { ImgFileService } from "src/common/service/imgfile.service";
import { MasterAuditModule } from "src/modules/master-audit/audit/audit.module";

@Module({
    imports:[TypeOrmModule.forFeature([Stations]),MasterAuditModule],
    controllers:[MasterCompanyStationsController],
    providers:[MasterCompanyStationsService,OpService,ImgFileService],
})

export class MasterCompanyStationsModule{}