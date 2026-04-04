import {
  Controller,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Get,
  Query,
  Delete,
  Param,
  ParseUUIDPipe,
  Patch,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AtGuard } from '../../../common/guards/at.guard';
import { Serialize } from '../../../common/interceptors/serialize.interceptor';
import { DriverResponseDto } from './serialize/driver-response.dto';
import { CreateDriverDto } from './dtos/create-driver.dto';
import { DriverService } from './driver.service';
import { OptimizeImageService } from '../../../common/service/optimize-image.service';
import { DriverDto } from './dtos/driver.dto';
import { UpdateDriverDto } from './dtos/update-driver.dto';

@Controller('driver')
// @UseGuards(AtGuard)
export class DriverController {
  constructor(
    private readonly driverService: DriverService,
    private readonly optimizeImageService: OptimizeImageService,
  ) {}

  @Get('list')
  @Serialize(DriverDto)
  async findAll(
    @Query('search') search?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.driverService.findAll({
      search,
      fromDate,
      toDate,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.driverService.findOne(id);
  }

  @Post('register')
  @Serialize(DriverResponseDto)
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() dto: CreateDriverDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let optimizedFile = file;
    if (file) {
      optimizedFile = await this.optimizeImageService.optimizeImage(file);
    }
    return this.driverService.createDriver(dto, optimizedFile);
  }

  @Patch(':id')
  @Serialize(DriverResponseDto)
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDriverDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let optimizedFile = file;
    if (file) {
      optimizedFile = await this.optimizeImageService.optimizeImage(file);
    }
    return this.driverService.update(id, dto, optimizedFile);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.driverService.remove(id);
  }
}
