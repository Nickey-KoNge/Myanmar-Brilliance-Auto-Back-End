import { Expose } from 'class-transformer';

export class GetTripFinanceSerialize {
  @Expose() id!: string;
  @Expose() trip_id!: string;
  @Expose() staff_id!: string;
  @Expose() rental_amount!: string | null;
  @Expose() overtime_amount!: string | null;
  @Expose() refund_amount!: string | null;
  @Expose() total!: string | null;
  @Expose() payment_status!: string;
  @Expose() receive_date!: Date | null;
  @Expose() status!: string;
  @Expose() created_at!: Date;
  @Expose() updated_at!: Date;
}
