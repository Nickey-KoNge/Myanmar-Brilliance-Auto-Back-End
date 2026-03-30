//src/modules/master-company/stations/dtos/update-stations.dto.ts
import { CreateStationsDto } from './create-stations.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateStationsDto extends PartialType(CreateStationsDto) {}