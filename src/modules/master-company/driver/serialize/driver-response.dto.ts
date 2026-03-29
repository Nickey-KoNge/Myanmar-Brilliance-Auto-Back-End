import { Expose } from 'class-transformer';

export class DriverResponseDto {
  @Expose() id: string;
  @Expose() driver_name: string;
  @Expose() nrc: string;
  @Expose() phone: string;
  @Expose() license_no: string;
  @Expose() image: string;
  @Expose() status: string;
}
