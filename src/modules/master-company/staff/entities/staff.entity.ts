import {
  Entity,
  PrimaryColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { Credential } from '../../credential/entities/credential.entity';
import { Company } from '../../company/entities/company.entity';
import { Branches } from '../../branches/entities/branches.entity';
import { Role } from '../../../master-service/role/entities/role.entity';
import { TripFinance } from '../../../master-rental/trip-finance/entities/trip-finance.entity';

@Entity({ name: 'staff', schema: 'master_company' })
@Index(['branch', 'status'])
@Index(['company', 'status'])
export class Staff {
  @PrimaryColumn({ type: 'uuid', default: () => 'uuid_generate_v7()' })
  id!: string;

  @Column({ name: 'staff_name', length: 100 })
  @Index()
  staffName!: string;

  @Column({ nullable: true, length: 20 })
  @Index()
  phone!: string;

  @Column({ length: 100, nullable: true })
  position!: string;

  @OneToOne(() => Credential, (cred) => cred.staff, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'credential_id' })
  @Index()
  credential!: Credential;

  @ManyToOne(() => Company, (company) => company.staff, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  @Index()
  company!: Company;

  @ManyToOne(() => Branches, (branch) => branch.staff, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'branches_id' })
  @Index()
  branch!: Branches;

  @ManyToOne(() => Role, (role) => role.staff, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  @Index()
  role!: Role;

  @Column({ type: 'varchar', length: 100, nullable: true })
  street_address!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  city!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  country!: string;

  @Column({ type: 'date', nullable: true })
  dob!: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  nrc!: string;

  @Column({ type: 'varchar', length: 20, default: 'Male' })
  @Index()
  gender!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  image!: string;

  @Column({ type: 'timestamp', nullable: true })
  last_login!: Date;

  @Column({ default: 'Active', length: 20 })
  @Index()
  status!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => TripFinance, (tripFinance) => tripFinance.staff)
  trip_finances!: TripFinance[];
}
