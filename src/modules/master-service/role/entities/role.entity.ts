// src/modules/master-service/role/entities/role.entity.ts

import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { Staff } from '../../../master-company/staff/entities/staff.entity';
@Entity({ schema: 'master_service', name: 'roles' })
export class Role {
  @PrimaryColumn({
    type: 'uuid',
    primary: true,
    default: () => 'uuid_generate_v7()',
  })
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 50 })
  role_name!: string;

  @Column({ type: 'varchar', length: 20, default: 'Active' })
  @Index()
  status!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @DeleteDateColumn()
  deleted_at!: Date;

  @OneToMany(() => Staff, (staff) => staff.role)
  staff!: Staff[];
}
