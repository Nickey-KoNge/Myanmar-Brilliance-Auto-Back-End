// src/modules/master-company/master-company.branches.public.service.ts
import { Injectable } from '@nestjs/common';
import { BranchesEntity

 } from './branches/entities/branches.entity';
 import { MasterCompanyBranchesService } from './branches/master-company.branches.service';

@Injectable()
export class MasterCompanyBranchesPublicService {
    constructor(
        private readonly service:MasterCompanyBranchesService
    ){}
}