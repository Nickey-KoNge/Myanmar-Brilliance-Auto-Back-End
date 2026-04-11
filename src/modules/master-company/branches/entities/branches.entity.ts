// src/modules/master-company/branches/entities/branches.entity.ts
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Company } from '../../company/entities/company.entity';
import { Staff } from '../../staff/entities/staff.entity';
import { Stations } from '../../stations/entities/stations.entity';
@Entity({ schema: 'master_company', name: 'branches' })
export class Branches {
  @Column({
    type: 'uuid',
    primary: true,
    default: () => 'uuid_generate_v7()',
  })
  id!: string;

  @Index()
  @Column({ type: 'varchar', length: 100 })
  branches_name!: string;

  @Column({ type: 'uuid' })
  @Index()
  company_id!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  gps_location!: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  phone!: string;

  @Column({ type: 'varchar', length: 50 })
  division!: string;

  @Column({ type: 'varchar', length: 50 })
  city!: string;

  @Column({ type: 'varchar', length: 100 })
  address!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Index()
  description!: string;

  @Column({ type: 'varchar', length: 20, default: 'Active' })
  @Index()
  status!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @DeleteDateColumn()
  deleted_at!: Date;

  @ManyToOne(() => Company, (company) => company.branches)
  @JoinColumn({ name: 'company_id' })
  company!: Company;

  @OneToMany(() => Staff, (staff) => staff.branch)
  staff!: Staff[];

  @OneToMany(() => Stations, (station) => station.branch)
  stations!: Stations[];
}
