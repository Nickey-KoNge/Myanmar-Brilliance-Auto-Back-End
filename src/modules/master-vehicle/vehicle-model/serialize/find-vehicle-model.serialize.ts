import { Expose, Type } from 'class-transformer';

class VehicleModelItemDto {
  @Expose() id!: string;
  @Expose() vehicle_model_name!: string;

  @Expose() vehicle_brand_name!: string;
  @Expose() vehicle_brand_id!: string;

  @Expose() body_type!: string;
  @Expose() fuel_type!: string;
  @Expose() engine_capacity!: string;
  @Expose() transmission!: string;
  @Expose() seat!: number;
  @Expose() status!: string;
  @Expose() createdAt!: Date;

  @Expose()
  activeCount!: number;

  @Expose()
  inactiveCount!: number;

  @Expose()
  lastEditedBy!: string;
}

class BrandItemDto {
  @Expose() id!: string;
  @Expose() name!: string;
}

class MetaDto {
  @Expose() totalItems!: number;
  @Expose() itemCount!: number;
  @Expose() itemsPerPage!: number;
  @Expose() totalPages!: number;
  @Expose() currentPage!: number;
  @Expose() activeItems!: number;
  @Expose() inactiveItems!: number;
}

export class VehicleModelDto {
  @Expose()
  @Type(() => VehicleModelItemDto)
  items!: VehicleModelItemDto[];

  @Expose()
  @Type(() => BrandItemDto)
  brands!: BrandItemDto[];

  @Expose()
  @Type(() => MetaDto)
  meta!: MetaDto;
}
