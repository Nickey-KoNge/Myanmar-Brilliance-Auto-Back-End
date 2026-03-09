import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('company')
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_name', length: 100 })
  companyName: string;

  @Column({ name: 'reg_number', length: 50 })
  regNumber: string;

  @Column({ name: 'street_address', length: 100 })
  streetAddress: string;

  @Column({ length: 50 })
  city: string;

  @Column({ length: 50 })
  country: string;

  @Column({ length: 20 })
  phone: string;

  @Column({ name: 'owner_name', length: 100 })
  ownerName: string;

  @Column({ name: 'owner_email', length: 100 })
  ownerEmail: string;

  @Column({ name: 'owner_phone', length: 20 })
  ownerPhone: string;

  @Column({ name: 'website_url', length: 100, nullable: true })
  websiteUrl: string;

  @Column({ name: 'establish_year', type: 'date', nullable: true })
  establishYear: Date;

  @Column({ name: 'reg_exp_date', type: 'date', nullable: true })
  regExpDate: Date;

  @Column({ name: 'image', length: 100, nullable: true })
  image: string;

  @Column({ length: 100 })
  email: string;

  @Column({ length: 20, default: 'active' })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}