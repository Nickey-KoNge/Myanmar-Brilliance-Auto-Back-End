//src/modules/master-company/credential/entities/credential.entity.ts
import {
  Entity,
  PrimaryColumn,
  Column,
  OneToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Staff } from '../../staff/entities/staff.entity';
import { RefreshToken } from './refresh-token.entity';
import { Driver } from '../../driver/entities/driver.entity';

@Entity({ name: 'credentials', schema: 'master_company' })
@Index(['email', 'status'])
export class Credential {
  @PrimaryColumn({ type: 'uuid', default: () => 'uuid_generate_v7()' })
  id: string;

  @Column({ unique: true, length: 100 })
  email: string;

  @Column({ select: false }) // Security: hide password from results
  password: string;

  @Column({ default: 'Active', length: 20 })
  @Index()
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => Staff, (staff) => staff.credential)
  staff: Staff;

  @OneToOne(() => Driver, (driver) => driver.credential_id)
  driver: Driver;

  @OneToMany(() => RefreshToken, (token) => token.credential)
  refreshTokens: RefreshToken[];
}
