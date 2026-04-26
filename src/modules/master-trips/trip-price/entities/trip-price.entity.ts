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
import { Route } from '../../route/entities/route.entity';
import { VehicleModels } from '../../../master-vehicle/vehicle-model/entities/vehicle-model.entity';
import { Stations } from '../../../master-company/stations/entities/stations.entity';

@Entity({ name: 'trip_prices', schema: 'master_trips' })
export class TripPrice {
  @PrimaryColumn({ type: 'uuid', default: () => 'uuid_generate_v7()' })
  id!: string;

  @Column({ type: 'uuid' })
  @Index()
  route_id!: string;

  @Column({ type: 'uuid' })
  @Index()
  vehicle_model_id!: string;

  @Column({ type: 'uuid' })
  @Index()
  station_id!: string;

  @Column({ type: 'varchar', length: 10 })
  daily_trip_rate!: string;

  @Column({ type: 'varchar', length: 10 })
  overnight_trip_rate!: string;

  @Column({ type: 'varchar', length: 20, default: 'Active' })
  @Index()
  status!: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;

  // --- Relations ---
  @ManyToOne(() => Route, (route) => route.trip_prices, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'route_id' })
  route!: Route;

  @ManyToOne(() => VehicleModels, (vm) => vm.trip_prices, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'vehicle_model_id' })
  vehicle_model_relation!: VehicleModels;

  @ManyToOne(() => Stations, (station) => station.trip_prices, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'station_id' })
  station_relation!: Stations;
}
