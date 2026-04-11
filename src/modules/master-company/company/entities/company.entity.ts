// src/modules/master-company/company/entities/company.entity.ts
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { Branches } from '../../branches/entities/branches.entity';
import { Staff } from '../../staff/entities/staff.entity';

@Entity({ schema: 'master_company', name: 'company' })
export class Company {
  @Column({
    type: 'uuid',
    primary: true,
    default: () => 'uuid_generate_v7()',
  })
  id!: string;

  @Index()
  @Column({ type: 'varchar', length: 100 })
  company_name!: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  @Index()
  reg_number!: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  phone!: string;

  @Index()
  @Column({ type: 'varchar', length: 100, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 50 })
  country!: string;

  @Column({ type: 'varchar', length: 50 })
  city!: string;

  @Column({ type: 'varchar', length: 100 })
  street_address!: string;

  @Column({ type: 'varchar', length: 100, default: 'Ko Khin Maung San' })
  owner_name!: string;

  @Column({ type: 'varchar', length: 20, default: '09XXXXXXX' })
  owner_phone!: string;

  @Index()
  @Column({ type: 'varchar', length: 100, default: 'example@gmail.com' })
  owner_email!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  website_url!: string;

  @Column({ type: 'date' })
  establish_year!: Date;

  @Column({ type: 'date' })
  reg_exp_date!: Date;

  @Column({ type: 'varchar', length: 500, nullable: true })
  image!: string;

  @Column({ type: 'varchar', length: 20, default: 'Active' })
  @Index()
  status!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @DeleteDateColumn()
  deleted_at!: Date;

  @OneToMany(() => Branches, (branch) => branch.company)
  branches!: Branches[];

  @OneToMany(() => Staff, (staff) => staff.company)
  staff!: Staff[];
}
