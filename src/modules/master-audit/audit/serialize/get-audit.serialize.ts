import { Expose } from 'class-transformer';

export class GetAuditSerialize {
  @Expose()
  id!: string;

  @Expose()
  entity_name!: string;

  @Expose()
  entity_id!: string;

  @Expose()
  action!: string;

  @Expose()
  old_values!: Record<string, any>;

  @Expose()
  new_values!: Record<string, any>;

  @Expose()
  performed_by!: string;
}
