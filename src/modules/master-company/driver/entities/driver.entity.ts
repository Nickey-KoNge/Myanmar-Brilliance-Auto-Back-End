// src/modules/master-company/driver/entities/driver.entity.ts
import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToOne,
} from 'typeorm';
import { Stations } from '../../stations/entities/stations.entity';
import { Credential } from '../../credential/entities/credential.entity';

@Entity({ name: 'driver', schema: 'master_company' })
@Index(['driver_name', 'status'])
export class Driver {
  @PrimaryColumn({ type: 'uuid', default: () => 'uuid_generate_v7()' })
  id: string;

  @Index()
  @Column({ unique: true, length: 100 })
  driver_name: string;

  @OneToOne(() => Credential, (cred) => cred.driver, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'credential_id' })
  @Index()
  credential_id: string;

  @Column({ type: 'uuid' })
  @Index()
  station_id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  @Index()
  nrc: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  @Index()
  phone: string;

  @Column({ type: 'varchar', length: 100 })
  @Index()
  address: string;

  @Column({ type: 'varchar', length: 50 })
  @Index()
  city: string;

  @Column({ type: 'varchar', length: 50 })
  @Index()
  country: string;

  @Column({ type: 'date', nullable: true })
  dob: Date;

  @Column({ type: 'varchar', length: 20, default: 'Male' })
  gender: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  deposits: string;

  @Column({ type: 'date', nullable: true })
  join_date: Date;

  @Column({ type: 'varchar', unique: true, length: 50 })
  license_no: string;

  @Column({ type: 'varchar', unique: true, length: 10 })
  license_type: string;

  @Column({ type: 'date', nullable: true })
  license_expiry: Date;

  @Column({ type: 'varchar', unique: true, length: 20 })
  driving_exp: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  image: string;

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
