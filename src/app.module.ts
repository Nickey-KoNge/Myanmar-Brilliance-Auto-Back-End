import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ScheduleModule } from '@nestjs/schedule';

import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './database/typeorm.config';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from './common/common.module';

import { MasterCompanyBranchesModule } from './modules/master-company/branches/master-company.branches.module';
import { MasterCompanyModule } from './modules/master-company/company/company.module';
import { MasterCredentialModule } from './modules/master-company/credential/credential.module';
import { MasterStaffModule } from './modules/master-company/staff/staff.module';
import { MasterServiceRoleModule } from './modules/master-service/role/master-service.role.module';
import { MasterCompanyStationsModule } from './modules/master-company/stations/master-company.stations.module';
import { MasterDriverModule } from './modules/master-company/driver/driver.module';
import { MasterVehicleBrandsModule } from './modules/master-vehicle/vehicle-brands/vehicle-brands.module';

import { MasterVehicleModelModule } from './modules/master-vehicle/vehicle-model/vehicle-model.module';

import { MasterVehicleModule } from './modules/master-vehicle/vehicle/master-vehicle.vehicle.module';

import { MasterVehicleDriverAssignModule } from './modules/master-vehicle/driver-assign/vehicle-driver-assign.module';
import { MasterGroupModule } from './modules/master-company/group/group.module';
import { RentalOperationModule } from './modules/master-rental/rental-operation/rental-op.module';
import { RouteModule } from './modules/master-trips/route/route.module';
import { TripPriceModule } from './modules/master-trips/trip-price/trip-price.module';

import { TripFinanceModule } from './modules/master-rental/trip-finance/trip-finance.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    TypeOrmModule.forRoot({
      ...dataSourceOptions,
      autoLoadEntities: true,
    }),

    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'),
      renderPath: '/public',
    }),
    ScheduleModule.forRoot(),

    MasterCompanyBranchesModule,
    MasterCompanyStationsModule,
    MasterCompanyModule,
    MasterStaffModule,
    MasterGroupModule,
    MasterCredentialModule,
    CommonModule,
    MasterServiceRoleModule,
    MasterDriverModule,
    MasterVehicleBrandsModule,
    MasterVehicleModelModule,
    MasterVehicleModule,
    MasterVehicleDriverAssignModule,
    RentalOperationModule,
    RouteModule,
    TripPriceModule,
    TripFinanceModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
