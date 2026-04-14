import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
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
import { AtGuard } from 'src/common/guards/at.guard';

interface AuthenticatedRequest {
  user?: {
    sub?: string;
    id?: string;
    staffName?: string;
    email?: string;
  };
}
@Controller('master-vehicle/vehicle-brands')
@UseGuards(AtGuard)
export class VehicleBrandsController {
  constructor(private readonly vehicleBrandsService: VehicleBrandsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() createVehicleBrandDto: CreateVehicleBrandsDto,
    @Req() req: AuthenticatedRequest,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const userId =
      req.user?.id ||
      req.user?.staffName ||
      req.user?.email ||
      req.user?.sub ||
      'Unknown User';
    return await this.vehicleBrandsService.create(
      createVehicleBrandDto,
      userId,
      file,
    );
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
    @Req() req: AuthenticatedRequest,
  ) {
    const userId =
      req.user?.id ||
      req.user?.staffName ||
      req.user?.email ||
      req.user?.sub ||
      'Unknown User';
    return await this.vehicleBrandsService.update(
      id,
      updateVehicleBrandsDto,
      userId,
      file,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const userId =
      req.user?.id ||
      req.user?.staffName ||
      req.user?.email ||
      req.user?.sub ||
      'Unknown User';
    return this.vehicleBrandsService.remove(id, userId);
  }
  @Post('restore/:auditId')
  async restore(
    @Param('auditId') auditId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId =
      req.user?.id ||
      req.user?.staffName ||
      req.user?.email ||
      req.user?.sub ||
      'Unknown User';
    return await this.vehicleBrandsService.restoreVehicleBrand(auditId, userId);
  }
}
