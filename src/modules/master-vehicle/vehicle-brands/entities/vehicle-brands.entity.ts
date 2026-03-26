// src/modules/master-vehicle/vehicle-brands/entities/vehicle-brands.entity.ts
import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity({ name: 'vehicle_brands', schema: 'master_vehicle' })
@Index(['country_of_origin', 'status'])
export class VehicleBrands {
  @PrimaryColumn({ type: 'uuid', default: () => 'uuid_generate_v7()' })
  id: string;

  @Index()
  @Column({ unique: true, length: 100 })
  vehicle_brand_name: string;

  @Column({ type: 'varchar', length: 50 })
  country_of_origin: string;

  @Column({ type: 'varchar', length: 100 })
  manufacturer: string;

  @Column({ type: 'varchar', length: 255 })
  image: string;

  @Column({ type: 'varchar', length: 255 })
  description: string;

  @Column({ default: 'Active', length: 20 })
  @Index()
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
