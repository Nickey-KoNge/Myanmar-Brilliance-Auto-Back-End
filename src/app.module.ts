//src/app.module.ts
import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './database/typeorm.config';
import { ConfigModule } from '@nestjs/config';
// import { CommonModule } from './common/common.module';
import { MasterCompanyBranchesModule } from './modules/master-company/branches/master-company.branches.module';

// import { MasterCompanyCompanyModule } from './modules/master-company/company/master-company.company.module';
import { CompanyModule } from './modules/master-company/company/company.module';
import { CredentialModule } from './modules/master-company/credential/credential.module';
import { StaffModule } from './modules/master-company/staff/staff.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    TypeOrmModule.forRoot({
      ...dataSourceOptions,
      autoLoadEntities: true,
    }),
    MasterCompanyBranchesModule,
    // MasterCompanyCompanyModule,

    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'),
    }),
    CompanyModule,
    StaffModule,
    CredentialModule,
  ],
})
export class AppModule {}
