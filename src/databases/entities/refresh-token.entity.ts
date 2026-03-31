import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm'
import { BaseEntity } from './base.entity'
import { User } from '@entities/user.entity'

@Entity('refresh_tokens')
export class RefreshToken extends BaseEntity {
  @Column({ unique: true, length: 255 })
  token: string

  @Column({ name: 'user_id' })
  userId: string

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User
}
