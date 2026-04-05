// src/modules/master-vehicle/vehicle-brands/entities/vehicle-brands.entity.ts
import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { VehicleModels } from '../../vehicle-model/entities/vehicle-model.entity';
@Entity({ name: 'vehicle_brands', schema: 'master_vehicle' })
@Index(['country_of_origin', 'status'])
export class VehicleBrands {
  @PrimaryColumn({ type: 'uuid', default: () => 'uuid_generate_v7()' })
  id!: string;

  @Index()
  @Column({ unique: true, length: 100 })
  vehicle_brand_name!: string;

  @Index()
  @Column({ length: 100, nullable: true })
  country_of_origin!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  manufacturer!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  image!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description!: string;

  @Column({ default: 'Active', length: 20, nullable: true })
  @Index()
  status!: string;

  @CreateDateColumn({ name: 'created_at', nullable: true })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updatedAt!: Date;

  @OneToMany(() => VehicleModels, (model) => model.vehicle_brand)
  models!: VehicleModels[];
}
