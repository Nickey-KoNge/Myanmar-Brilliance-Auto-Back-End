import { IsNotEmpty, IsOptional, IsString} from "class-validator";

//src/modules/master-company/stations/dtos/create-stations.dto.ts
export class CreateStationsDto {
    @IsNotEmpty()
    @IsString()
    station_name: string;

    @IsNotEmpty()
    @IsString()
    branches_id: string;

    @IsNotEmpty()
    @IsString()
    gps_location: string;

    @IsNotEmpty()
    @IsString()
    division: string;

    @IsNotEmpty()
    @IsString()
    city: string;

    @IsNotEmpty()
    @IsString()
    address: string;

    @IsNotEmpty()
    @IsString()
    phone: string;

    @IsNotEmpty()
    @IsString()
    description: string;

    @IsOptional()
    @IsString()
    status?: string;

}