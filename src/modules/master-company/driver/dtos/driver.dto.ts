import { Expose, Type } from 'class-transformer';

// Driver တစ်ဦးချင်းစီအတွက် ပြချင်တဲ့ Field များ
class DriverItemDto {
  @Expose() id: string;
  @Expose() driver_name: string;
  @Expose() nrc: string;
  @Expose() phone: string;
  @Expose() license_no: string;
  @Expose() address: string;
  @Expose() city: string;
  @Expose() image: string;
  @Expose() status: string;
  @Expose() createdAt: Date;
}

// Pagination Meta အချက်အလက်များ
class MetaDto {
  @Expose() totalItems: number;
  @Expose() itemCount: number;
  @Expose() itemsPerPage: number;
  @Expose() totalPages: number;
  @Expose() currentPage: number;
}

// Controller မှာ သုံးထားတဲ့ အဓိက Class
export class DriverDto {
  @Expose()
  @Type(() => DriverItemDto)
  items: DriverItemDto[];

  @Expose()
  @Type(() => MetaDto)
  meta: MetaDto;
}
