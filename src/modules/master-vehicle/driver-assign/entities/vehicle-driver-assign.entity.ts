// src/modules/master-vehicle/driver-assign/entities/vehicle-driver-assign.entity.ts
import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Vehicle } from '../../../master-vehicle/vehicle/entities/vehicle.entity';
import { Driver } from '../../../master-company/driver/entities/driver.entity';
import { Stations } from '../../../master-company/stations/entities/stations.entity';

@Entity({ name: 'driver_assigns', schema: 'master_vehicle' })
export class VehicleDriverAssign {
  @PrimaryColumn({ type: 'uuid', default: () => 'uuid_generate_v7()' })
  id!: string;

  // --- Driver Relation (Many-to-One) ---
  @Column({ type: 'uuid' })
  @Index()
  driver_id!: string;

  @ManyToOne(() => Driver, (driver) => driver.assignments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'driver_id' })
  driver!: Driver;

  // --- Vehicle Relation (Many-to-One) ---
  @Column({ type: 'uuid' })
  @Index()
  vehicle_id!: string;

  @ManyToOne(() => Vehicle, (vehicle) => vehicle.assignments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'vehicle_id' })
  vehicle!: Vehicle;

  // --- Station Relation (Many-to-One) ---
  @ManyToOne(() => Stations, (station) => station.driver_assignments, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'station_id' })
  station!: Stations;

  // --- Assignment Details ---

  @Column({ type: 'date', nullable: true })
  assigned_at!: Date;

  @Column({ type: 'date', nullable: true })
  returned_at!: Date;

  @Column({ type: 'varchar', length: 10, nullable: true })
  start_odometer!: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  end_odometer!: string;

  @Column({ default: 'Active', length: 20 })
  @Index()
  status!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
