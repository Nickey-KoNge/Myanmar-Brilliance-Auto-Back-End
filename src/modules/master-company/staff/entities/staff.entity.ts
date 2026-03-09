import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Credential } from '../../credential/entities/credential.entity';
import { Company } from '../../company/entities/company.entity';

@Entity({ name: 'staff', schema: 'master_company' })
export class Staff {
  @PrimaryColumn({ type: 'uuid', default: () => 'uuid_generate_v7()' })
  id: string;

  @Column({ name: 'staff_name', length: 100 })
  staffName: string;

  @Column({ nullable: true, length: 20 })
  phone: string;

  @Column({ length: 100, nullable: true })
  position: string;

  @Column({ default: 'Active', length: 20 })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => Credential, (cred) => cred.staff, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'credential_id' })
  credential: Credential;

  @ManyToOne(() => Company, (company) => company.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;
}