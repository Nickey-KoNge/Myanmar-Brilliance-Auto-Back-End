import { Expose } from 'class-transformer';

export class GroupResponseDto {
  @Expose() id: string;
  @Expose() group_name: string;
  @Expose() group_type: string;
  @Expose() station_id: string;
  @Expose() description: string;
  @Expose() status: string;
  @Expose() createdAt: Date;
}