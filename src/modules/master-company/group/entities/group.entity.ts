// src/modules/master-company/group/entities/group.entity.ts
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
import { Stations } from '../../stations/entities/stations.entity';

@Entity({ name: 'groups', schema: 'master_company' })
@Index(['group_name', 'status'])
export class Group {
  @PrimaryColumn({ type: 'uuid', default: () => 'uuid_generate_v7()' })
  id: string;

  @Index()
  @Column({ unique: true, length: 100 })
  group_name: string;

  @Index()
  @Column({ unique: true, length: 20 })
  group_type: string;

  @Column({ type: 'uuid' })
  @Index()
  station_id: string;

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

  @ManyToOne(() => Stations, (station) => station.branch, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'station_id' })
  stations: Stations;
}
