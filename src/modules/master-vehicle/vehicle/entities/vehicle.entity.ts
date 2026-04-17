// src/modules/master-vehicle/vehicle/entities/vehicle.entity.ts
import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

import { VehicleModels } from '../../vehicle-model/entities/vehicle-model.entity';
import { Stations } from '../../../master-company/stations/entities/stations.entity';
import { Group } from '../../../master-company/group/entities/group.entity';
// import { Supplier } from '../../supplier/entities/supplier.entity';
import { VehicleDriverAssign } from '../../../master-vehicle/driver-assign/entities/vehicle-driver-assign.entity';
import { RentalOperation } from '../../../master-rental/rental-operation/entities/rental-operation.entity';

@Entity({ name: 'vehicles', schema: 'master_vehicle' })
@Index(['vehicle_name', 'license_plate', 'status'])
export class Vehicle {
  @PrimaryColumn({ type: 'uuid', default: () => 'uuid_generate_v7()' })
  id!: string;

  @Index()
  @Column({ type: 'varchar', length: 100 })
  vehicle_name!: string;

  // --- Foreign Keys (Relations) ---

  @Column({ type: 'uuid', nullable: true })
  @Index()
  station_id!: string;

  @ManyToOne(() => Stations, (station) => station.vehicles, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'station_id' })
  station!: Stations;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  group_id!: string;

  @ManyToOne(() => Group, (group) => group.vehicles, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'group_id' })
  group!: Group;

  @Column({ type: 'uuid' })
  @Index()
  vehicle_model_id!: string;

  @ManyToOne(() => VehicleModels, (model) => model.vehicles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'vehicle_model_id' })
  vehicle_model!: VehicleModels;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  supplier_id!: string;

  // @ManyToOne(() => Supplier)
  // @JoinColumn({ name: 'supplier_id' })
  // supplier!: Supplier;

  // --- Vehicle Details ---

  @Column({ type: 'varchar', length: 20, nullable: true })
  city_taxi_no!: string;

  @Index()
  @Column({ type: 'varchar', length: 50, nullable: true })
  serial_no!: string;

  @Index()
  @Column({ type: 'varchar', length: 50, nullable: true })
  vin_no!: string;

  @Index()
  @Column({ type: 'varchar', length: 50, nullable: true })
  engine_no!: string;

  @Index()
  @Column({ type: 'varchar', length: 50 })
  license_plate!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  color!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  license_type!: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  current_odometer!: string;

  // --- Dates ---

  @Column({ type: 'date', nullable: true })
  vehicle_license_exp!: Date;

  @Column({ type: 'date', nullable: true })
  service_intervals!: Date;

  @Column({ type: 'date', nullable: true })
  purchase_date!: Date;

  // --- Other Info ---

  @Column({ type: 'varchar', length: 255, nullable: true })
  image!: string;

  @Index()
  @Column({ default: 'Active', length: 20 })
  status!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => VehicleDriverAssign, (assign) => assign.vehicle)
  assignments!: VehicleDriverAssign[];

  @OneToMany(() => RentalOperation, (ro) => ro.driver)
  rental_operations!: RentalOperation[];
}
