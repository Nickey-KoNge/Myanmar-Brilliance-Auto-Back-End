import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { TripPrice } from '../../trip-price/entities/trip-price.entity';
import { RentalOperation } from '../../../master-rental/rental-operation/entities/rental-operation.entity';
@Entity({ name: 'route', schema: 'master_trips' })
export class Route {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  @Index()
  route_name!: string;

  @Column({ type: 'varchar', length: 100 })
  start_location!: string;

  @Column({ type: 'varchar', length: 100 })
  end_location!: string;

  @Column({ type: 'varchar', length: 20, default: 'Active' })
  @Index()
  status!: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;

  // --- Relation ---
  @OneToMany(() => TripPrice, (tripPrice) => tripPrice.route)
  trip_prices!: TripPrice[];

  @OneToMany(() => RentalOperation, (ro) => ro.route)
  rental_operations!: RentalOperation[];
}
