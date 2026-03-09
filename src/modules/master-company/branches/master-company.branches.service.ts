// src/modules/master-company/branches/master-company.branches.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { BranchesEntity } from './entities/branches.entity';
import { Create } from 'sharp';
import { CreateBranchesDto } from './dtos/create-branches.dto';
import { UpdateBranchesDto } from './dtos/update-branches.dto';

@Injectable()
export class MasterCompanyBranchesService {

    constructor(
        @InjectRepository(BranchesEntity)
        private readonly branchesRepository: Repository<BranchesEntity>
    ){}


    async create(dto:CreateBranchesDto):Promise<BranchesEntity>{
        const branch=this.branchesRepository.create(dto);
        return await this.branchesRepository.save(branch);
    }


    async findAll():Promise<BranchesEntity[]>{
        return await this.branchesRepository.find();
    }

    async findOne(id:string):Promise<BranchesEntity>{
        const branch= await this.branchesRepository.findOne({ where: { id } });
        if(!branch){
            throw new NotFoundException('Branch not found');
        }
        return branch;
    }


    async update(id:string,dto:UpdateBranchesDto):Promise<BranchesEntity>{
        await this.findOne(id);
        await this.branchesRepository.update(id,dto);
        return await this.findOne(id);
    }


    async remove(id:string):Promise<BranchesEntity>{
        const branch= await this.findOne(id);
        return await this.branchesRepository.remove(branch);
    }

    
}