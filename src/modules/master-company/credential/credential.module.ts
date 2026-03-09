import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { CredentialsService } from './credential.service'; 
import { CredentialsController } from './credential.controller'; 
import { Credential } from './entities/credential.entity';
import { Staff } from '../staff/entities/staff.entity';
import { RefreshToken } from './entities/refresh-token.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Credential, Staff, RefreshToken]),
    PassportModule,
    JwtModule.register({}), // Configuration will be handled in the service
  ],
  controllers: [CredentialsController], 
  providers: [CredentialsService],       
  exports: [CredentialsService], 
})
export class CredentialModule {}