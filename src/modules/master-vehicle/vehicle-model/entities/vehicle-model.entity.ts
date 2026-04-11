// src/modules/master-vehicle/vehicle-model/entities/vehicle-model.entity.ts
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
import { VehicleBrands } from '../../vehicle-brands/entities/vehicle-brands.entity';
import { Vehicle } from '../../vehicle/entities/vehicle.entity';
@Entity({ name: 'vehicle_models', schema: 'master_vehicle' })
@Index(['vehicle_model_name', 'fuel_type', 'status'])
export class VehicleModels {
  @PrimaryColumn({ type: 'uuid', default: () => 'uuid_generate_v7()' })
  id!: string;

  @Index()
  @Column({ unique: true, length: 100 })
  vehicle_model_name!: string;

  @Column({ type: 'uuid' })
  @Index()
  vehicle_brand_id!: string;

  @ManyToOne(() => VehicleBrands, (vb) => vb.models, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vehicle_brand_id' })
  vehicle_brand!: VehicleBrands;

  @OneToMany(() => Vehicle, (vehicle) => vehicle.vehicle_model)
  vehicles!: Vehicle[];

  @Index()
  @Column({ type: 'varchar', length: 50 })
  body_type!: string;

  @Column({ type: 'varchar', length: 50 })
  fuel_type!: string;

  @Column({ type: 'varchar', length: 50 })
  transmission!: string;

  @Index()
  @Column({ type: 'varchar', length: 20 })
  engine_capacity!: string;

  @Index()
  @Column({ type: 'date' })
  year_of_release!: Date;

  @Column({ default: 'Active', length: 20 })
  @Index()
  status!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
