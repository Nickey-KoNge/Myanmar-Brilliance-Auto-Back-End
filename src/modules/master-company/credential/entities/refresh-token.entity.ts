import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Credential } from './credential.entity';

@Entity({ name: 'refresh_tokens', schema: 'master_company' })
export class RefreshToken {
  @PrimaryColumn({ type: 'uuid', default: () => 'uuid_generate_v7()' })
  id: string;

  @Column({ name: 'refresh_token', length: 500 })
  token: string;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;

  @Column({ default: false })
  revoked: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Credential, (cred) => cred.refreshTokens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'credential_id' })
  credential: Credential;
}