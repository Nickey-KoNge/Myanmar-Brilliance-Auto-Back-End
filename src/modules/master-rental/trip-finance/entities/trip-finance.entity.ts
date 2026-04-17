import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { RentalOperation } from '../../rental-operation/entities/rental-operation.entity';

import { Staff } from '../../../master-company/staff/entities/staff.entity';

@Entity({ name: 'trip_finances', schema: 'master-rental' })
export class TripFinance {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  @Index()
  trip_id!: string;

  @Column({ type: 'uuid' })
  @Index()
  staff_id!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  rental_amount!: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  overtime_amount!: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  refund_amount!: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  total!: string | null;

  @Column({ type: 'varchar', length: 20, default: 'Pending' })
  @Index()
  payment_status!: string;

  @Column({ type: 'varchar', length: 20, default: 'Active' })
  @Index()
  status!: string;

  @Column({ type: 'date', nullable: true })
  receive_date!: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;

  // --- Relations ---
  @ManyToOne(() => RentalOperation, (ro) => ro.trip_finances, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'trip_id' })
  trip_operation!: RentalOperation;

  @ManyToOne(() => Staff, (staff) => staff.trip_finances)
  @JoinColumn({ name: 'staff_id' })
  staff!: Staff;
}
