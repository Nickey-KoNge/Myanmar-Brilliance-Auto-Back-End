import { Expose, Type } from 'class-transformer';

class DriverItemDto {
  @Expose() id: string;
  @Expose() driver_name: string;
  @Expose() nrc: string;
  @Expose() phone: string;
  @Expose() license_no: string;
  @Expose() address: string;
  @Expose() city: string;
  @Expose() image: string;
  @Expose() dob: Date;
  @Expose() status: string;
  @Expose() createdAt: Date;
}

class StationItemDto {
  @Expose() id: string;
  @Expose() name: string;
}

class MetaDto {
  @Expose() totalItems: number;
  @Expose() itemCount: number;
  @Expose() itemsPerPage: number;
  @Expose() totalPages: number;
  @Expose() currentPage: number;
  @Expose() activeItems: number;
  @Expose() inactiveItems: number;
}

export class DriverDto {
  @Expose()
  @Type(() => DriverItemDto)
  items: DriverItemDto[];

  @Expose()
  @Type(() => StationItemDto)
  stations: StationItemDto[];

  @Expose()
  @Type(() => MetaDto)
  meta: MetaDto;
}
