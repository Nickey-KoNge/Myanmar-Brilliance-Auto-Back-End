import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  PrimaryColumn,
} from 'typeorm';

@Entity({ name: 'company', schema: 'master_company' })
export class Company {
  @PrimaryColumn({
    type: 'uuid',
    default: () => 'uuid_generate_v7()',
  })
  id: string;

  @Index() // Matching the index from your migration
  @Column({ name: 'company_name', length: 100 })
  companyName: string;

  @Column({ name: 'reg_number', length: 50, unique: true })
  regNumber: string;

  @Column({ length: 20, unique: true })
  phone: string;

  @Column({ length: 100, unique: true })
  email: string;

  @Column({ length: 50 })
  country: string;

  @Column({ length: 50 })
  city: string;

  @Column({ name: 'street_address', length: 100 })
  streetAddress: string;

  @Column({ name: 'website_url', length: 100, nullable: true })
  websiteUrl: string;

  @Column({ name: 'establish_year', type: 'date' })
  establishYear: Date;

  @Column({ name: 'reg_exp_date', type: 'date' })
  regExpDate: Date;

  @Column({ length: 500, nullable: true })
  image: string;

  @Column({ length: 20, default: 'Active' })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date;
}
