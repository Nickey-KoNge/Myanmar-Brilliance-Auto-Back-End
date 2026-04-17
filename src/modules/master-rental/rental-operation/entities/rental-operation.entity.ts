import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Route } from '../../../master-trips/route/entities/route.entity';
import { Vehicle } from '../../../master-vehicle/vehicle/entities/vehicle.entity';
import { Driver } from '../../../master-company/driver/entities/driver.entity';
import { Stations } from '../../../master-company/stations/entities/stations.entity';
import { TripFinance } from '../../trip-finance/entities/trip-finance.entity';

@Entity({ name: 'rental_operations', schema: 'master_rental' })
export class RentalOperation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  @Index()
  route_id!: string;

  @Column({ type: 'uuid' })
  @Index()
  vehicle_id!: string;

  @Column({ type: 'uuid' })
  @Index()
  driver_id!: string;

  @Column({ type: 'uuid' })
  @Index()
  station_id!: string;

  @Column({ type: 'varchar', length: 2, nullable: true })
  daily_count!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description!: string | null;

  @Column({ type: 'timestamp', nullable: true })
  start_time!: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  end_time!: Date | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  start_odo!: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  end_odo!: string | null;

  @Column({ type: 'varchar', length: 3, nullable: true })
  start_battery!: string | null;

  @Column({ type: 'varchar', length: 3, nullable: true })
  end_battery!: string | null;

  @Column({ type: 'varchar', length: 2, nullable: true })
  extra_hours!: string | null;

  @Column({ type: 'varchar', length: 2, nullable: true })
  overnight_count!: string | null;

  @Column({ type: 'varchar', length: 20, default: 'Pending' })
  @Index()
  trip_status!: string;

  @Column({ type: 'varchar', length: 5, nullable: true })
  distance!: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  power_station_name!: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  kw!: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  amount!: string | null;

  @Column({ type: 'varchar', length: 20, default: 'Active' })
  @Index()
  status!: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;

  // --- Relations ---
  @ManyToOne(() => Route, (route) => route.rental_operations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'route_id' })
  route!: Route;

  @ManyToOne(() => Vehicle, (vehicle) => vehicle.rental_operations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'vehicle_id' })
  vehicle!: Vehicle;

  @ManyToOne(() => Driver, (driver) => driver.rental_operations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'driver_id' })
  driver!: Driver;

  @ManyToOne(() => Stations, (station) => station.rental_operations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'station_id' })
  station!: Stations;

  @OneToMany(() => TripFinance, (tf) => tf.trip_operation)
  trip_finances!: TripFinance[];
}
