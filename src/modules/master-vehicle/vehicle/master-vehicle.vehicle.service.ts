import { OpService } from "src/common/service/op.service";
import { In, Repository } from "typeorm";
import { Vehicle } from "./entities/vehicle.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateVehicleDto } from "./dtos/create-vehicle.dto";
import { OptimizeImageService } from "src/common/service/optimize-image.service";
import { IFileService } from "src/common/service/i-file.service";
import { Inject } from "@nestjs/common";
import { UpdateVehicleDto } from "./dtos/update-vehicle.dto";

import { NotFoundException } from "@nestjs/common";
import { SelectQueryBuilder } from "typeorm/browser";
import { PaginateVehicleDto } from "./dtos/paginate-vehicle.dto";

export class MasterVehicleService{
    constructor(
      

        @InjectRepository(Vehicle)
        private readonly vehicleRespository:Repository<Vehicle>,



        @Inject(IFileService)
        private readonly fileService:IFileService,
        private readonly optimizeImageService: OptimizeImageService,
        private readonly opService:OpService,

    ){}
    


    async create(dto:CreateVehicleDto,file?: Express.Multer.File):Promise<Vehicle>{
        
        if(file){
            const optimizedFile=await this.optimizeImageService.optimizeImage(file);
            const imageUrl=await this.fileService.uploadFile(optimizedFile,'vehicle');
            dto.image=imageUrl;

        }


        return await this.opService.create<Vehicle>(this.vehicleRespository,dto);
    }


    async findAll(query:PaginateVehicleDto){
        // return await this.vehicleRespository.find();
        const {
            page,
            limit,
            search,
            lastId,
            station_id: stations_id,
            group_id: groups_id,
            vehicle_model_id: vehicle_models_id,
            supplier_id: suppliers_id,
            status,
            lastCreatedAt,
            startDate,
            endDate,

        }= query;


        const queryBuilder=this.vehicleRespository.createQueryBuilder('vehicles');
        queryBuilder
        .leftJoinAndSelect('vehicles.station','station')
        .leftJoinAndSelect('vehicles.group','group')
        .leftJoinAndSelect('vehicles.vehicle_model','vehicle_model');   

        queryBuilder.addSelect([
            'station.id',
            'station.station_name',
            'group.id',
            'group.group_name',
            'vehicle_model.id',
            'vehicle_model.vehicle_model_name',
        ]);

        if(stations_id){
            queryBuilder.andWhere('vehicles.station=:stations_id',{stations_id});
        }

        if(groups_id){
            queryBuilder.andWhere('vehicles.group=:groups_id',{groups_id});
        }

        if(vehicle_models_id){
            queryBuilder.andWhere('vehicles.vehicle_model=:vehicle_models_id',{vehicle_models_id});
        }

        if(suppliers_id){
            queryBuilder.andWhere('vehicles.supplier_id=:suppliers_id',{suppliers_id});
        }


        if(status){
            queryBuilder.andWhere('vehicles.status=:status',{status});
        }

        if(search){
            queryBuilder.andWhere(
                `(vehicles.vehicle_name ILike :search 
                OR vehicles.license_plate ILike :search
                OR vehicles.city_taxi_no ILike :search
                OR vehicles.serial_no ILike :search
                OR vehicles.vin_no ILike :search
                OR vehicles.engine_no ILike :search
                OR vehicles.color ILike :search
                OR vehicles.license_type ILike :search
                OR vehicles.current_odometer ILike :search
                OR CAST(vehicles.vehicle_license_exp AS TEXT) ILike :search
                OR CAST(vehicles.service_intervals AS TEXT) ILike :search
                OR CAST(vehicles.purchase_date AS TEXT) ILike :search)
                `,
                {search:`%${search}%`},
            );
        }


        if(startDate || endDate){
            if(startDate){
                queryBuilder.andWhere('vehicles.createdAt >= :startDate',{startDate:`${startDate} 00:00:00`});
            }
            if(endDate){
                queryBuilder.andWhere('vehicles.createdAt <= :endDate',{endDate:`${endDate} 23:59:59`});
            }
        }


        if(lastId && lastCreatedAt && lastId !=='undefined'){
            queryBuilder.andWhere(
                '(vehicles.createdAt < :lastCreatedAt OR (vehicles.createdAt = :lastCreatedAt AND vehicles.id < :lastId))',
                {lastCreatedAt,lastId},
            );
        }else{
           
            const skip=(page-1)*limit;
            queryBuilder.skip(skip);
        }

        const rawData=await queryBuilder.orderBy('vehicles.createdAt','DESC')
        .addOrderBy('vehicles.id','DESC')
        .take(limit)
        .getMany();


        const data=rawData.map(vehicle=>({
            id:vehicle.id,
            vehicle_name:vehicle.vehicle_name,
            city_taxi_no:vehicle.city_taxi_no,
            serial_no:vehicle.serial_no,
            vin_no:vehicle.vin_no,
            engine_no:vehicle.engine_no,
            license_plate:vehicle.license_plate,
            color:vehicle.color,
            license_type:vehicle.license_type,
            current_odometer:vehicle.current_odometer,
            vehicle_license_exp:vehicle.vehicle_license_exp,
            service_intervals:vehicle.service_intervals,
            purchase_date:vehicle.purchase_date,
            image:vehicle.image,
            status:vehicle.status,
            station_id:vehicle.station?.id || null,
            station_name:vehicle.station?.station_name || null,
            group_id:vehicle.group?.id || null,
            group_name:vehicle.group?.group_name || null,
            vehicle_model_id:vehicle.vehicle_model?.id || null,
            vehicle_model_name:vehicle.vehicle_model?.vehicle_model_name || null,
            supplier_id:vehicle.supplier_id || null,
        }));


        const hasFilters=Boolean(search || stations_id || groups_id || vehicle_models_id || suppliers_id || startDate || endDate);
        const total=await this.getOptimizedCount(queryBuilder,hasFilters);

        return {
            data,
            total,
            totalPages:Math.ceil(total/limit) || 1,
            currentPage:page,
        };
        


    }










    private async getOptimizedCount(
        queryBuilder:SelectQueryBuilder<Vehicle>,
        hasFilters:boolean,
    ):Promise<number>{
        if(hasFilters){
            return await queryBuilder.getCount();
        }

        try{
            const result=await this.vehicleRespository.query<{estimate:number}>(
                `
                 SELECT reltuples::bigint AS estimate FROM pg_class c 
                JOIN pg_namespace n ON n.oid = c.relnamespace
                WHERE n.nspname = 'master_vehicle' AND c.relname = 'vehicles';
                `
            );

            const estimate=result[0]?.estimate? Number(result[0].estimate):0;
            return estimate < 1000 ? await this.vehicleRespository.count() : estimate;
        }catch{
            return await this.vehicleRespository.count();
        }
    }



    async findOne(id:string):Promise<Vehicle>{
        const vehicle=await this.vehicleRespository.findOne(
            {
                where:{id},
                relations:{
                    station:true,
                    group:true,
                    vehicle_model:true,
                },
                select:{
                    station:{
                        id:true,
                        station_name:true,
                    },
                    group:{
                        id:true,
                        group_name:true,
                    },
                    vehicle_model:{
                        id:true,
                        vehicle_model_name:true,
                    },
                    id:true,
                    vehicle_name:true,
                    city_taxi_no:true,
                    serial_no:true,
                    vin_no:true,
                    engine_no:true,
                    license_plate:true,
                    color:true,
                    license_type:true,
                    current_odometer:true,
                    vehicle_license_exp:true,
                    service_intervals:true,
                    purchase_date:true,
                    image:true,
                    status:true,

                 
                },
            }
        );

        if(!vehicle){
            throw new NotFoundException('Vehicle not found');
        }

        return vehicle;
                
    }



    async update(
        id:string,
        updateDto:UpdateVehicleDto,
        file?: Express.Multer.File
    ):Promise<Vehicle> {

        // const vehicle=await this.vehicleRespository.findOne({
        //     where:{id},
        //     relations:['station','group','vehicle_model'],

        // });

        // if(!vehicle){
        //     throw new NotFoundException('Vehicle not found');
        // }

        await this.findOne(id); 

        if(file){
            const optimizedFile=await this.optimizeImageService.optimizeImage(file);
            const imageUrl=await this.fileService.uploadFile(optimizedFile,'vehicle');
            updateDto.image=imageUrl;
        }

        return await this.opService.update<Vehicle>(this.vehicleRespository,id,updateDto);

    }


    async remove(id:string):Promise<Vehicle>{
        await this.findOne(id);
        return await this.opService.remove<Vehicle>(this.vehicleRespository,id);
    }
       

}