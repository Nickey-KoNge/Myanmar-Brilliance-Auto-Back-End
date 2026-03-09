//src/modules/master-company/branches/master-company.branches.controller.ts
import { Body, Controller, Delete, Get, Patch, Post, Put,Param } from '@nestjs/common';
import { CreateBranchesDto } from './dtos/create-branches.dto';
import { MasterCompanyBranchesService } from './master-company.branches.service';
import { UpdateBranchesDto } from './dtos/update-branches.dto';

@Controller('master-company/branches')
export class MasterCompanyBranchesController {
    constructor(
        private readonly service:MasterCompanyBranchesService
    ){}

    @Post()
    async create(@Body() dto:CreateBranchesDto){
        return await this.service.create(dto);
    }

    @Get()
    async findAll(){
        return await this.service.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id:string){
        return await this.service.findOne(id);
    }

    @Patch(':id')
    async update(@Param('id') id:string,@Body() dto:UpdateBranchesDto){
        return await this.service.update(id,dto);
    }

    @Delete(':id')
    async remove(@Param('id') id:string){
        return await this.service.remove(id);
    }

}
