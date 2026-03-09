//src/modules/master-company/branches/dtos/create-branches.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBranchesDto {
    
    @IsNotEmpty()
    @IsString()
    branches_name:string;
    @IsNotEmpty()
    @IsString()                 
    gps_location:string;

    @IsNotEmpty()
    @IsString()
    description:string;

    @IsNotEmpty()
    @IsString()
    phone:string;   

    @IsNotEmpty()    
    @IsString()
    status:string;
    
    @IsNotEmpty()
    @IsString()
    address:string;

    @IsNotEmpty()
    @IsString()
    city:string;

    @IsNotEmpty()
    @IsString()
    state:string;

    @IsNotEmpty()
    @IsString()
    company_id:string;  
}