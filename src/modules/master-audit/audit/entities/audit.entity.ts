// src/modules/master-audit/audit/entities/audit.entity.ts
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  DeleteDateColumn,
} from 'typeorm';

@Entity({ schema: 'master_audit', name: 'audit' })
export class Audit {
  @Column({
    type: 'uuid',
    primary: true,
    default: () => 'uuid_generate_v7()',
  })
  id!: string;

  @Index()
  @Column({ type: 'varchar', length: 100 })
  entity_name!: string;

  @Index()
  @Column({ type: 'varchar', length: 100 })
  entity_id!: string;

  @Column({ type: 'varchar', length: 20 })
  action!: string;

  @Column({ type: 'jsonb', nullable: true })
  old_values!: Record<string, any> | null;

  @Column({ type: 'jsonb', nullable: true })
  new_values!: Record<string, any> | null;

  @Column({ type: 'varchar', length: 100 })
  performed_by!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @DeleteDateColumn()
  deleted_at!: Date;
}
