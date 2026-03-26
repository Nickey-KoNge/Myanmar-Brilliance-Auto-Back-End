// src/modules/master-company/stations/entities/stations.entity.ts
import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Branches } from '../../branches/entities/branches.entity';

@Entity({ name: 'stations', schema: 'master_company' })
@Index(['division', 'status'])
export class Stations {
  @PrimaryColumn({ type: 'uuid', default: () => 'uuid_generate_v7()' })
  id: string;

  @Index()
  @Column({ unique: true, length: 100 })
  station_name: string;

  @Column({ type: 'uuid' })
  @Index()
  branches_id: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  gps_location: string;

  @Index()
  @Column({ type: 'varchar', length: 100 })
  division: string;

  @Index()
  @Column({ type: 'varchar', length: 50 })
  city: string;

  @Column({ type: 'varchar', length: 100 })
  address: string;

  @Column({ nullable: true, length: 20 })
  @Index()
  phone: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Index()
  description: string;

  @Column({ default: 'Active', length: 20 })
  @Index()
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Branches, (branch) => branch.stations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'branches_id' })
  branch: Branches;
}
