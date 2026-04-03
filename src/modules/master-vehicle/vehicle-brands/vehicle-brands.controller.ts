import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { VehicleBrandsService } from './vehicle-brands.service';
import { CreateVehicleBrandsDto } from './dtos/create-vehicle-brands.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateVehicleBrandsDto } from './dtos/update-vehicle-brands.dto';
import { PaginateBranchesDto } from 'src/modules/master-company/branches/dtos/paginate-branches.dto';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { FindVehicleBrandsSerialize } from './serialize/find-vehicle-brands.serialize';
import { GetVehicleBrandsSerialize } from './serialize/get-vehicle-brands.serialize';

@Controller('master-vehicle/vehicle-brands')
export class VehicleBrandsController {
  constructor(private readonly vehicleBrandsService: VehicleBrandsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() createVehicleBrandDto: CreateVehicleBrandsDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.vehicleBrandsService.create(createVehicleBrandDto, file);
  }

  @Get()
  @Serialize(FindVehicleBrandsSerialize)
  findAll(@Query() query: PaginateBranchesDto) {
    return this.vehicleBrandsService.findAll(query);
  }

  @Get(':id')
  @Serialize(GetVehicleBrandsSerialize)
  async findOne(@Param('id') id: string) {
    return this.vehicleBrandsService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'))
  @Serialize(GetVehicleBrandsSerialize)
  async update(
    @Param('id') id: string,
    @Body()
    updateVehicleBrandsDto: UpdateVehicleBrandsDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.vehicleBrandsService.update(
      id,
      updateVehicleBrandsDto,
      file,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vehicleBrandsService.remove(id);
  }
}
