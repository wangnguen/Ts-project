import { Entity, Column } from 'typeorm'
import { BaseEntity } from './base.entity'

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user'
}

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true, length: 30 })
  username: string

  @Column({ select: false, length: 72 })
  password: string

  @Column({ unique: true, length: 255 })
  email: string

  @Column({ name: 'full_name', length: 255 })
  fullName: string

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole

  @Column({ default: false })
  isVerified: boolean

  @Column({ name: 'last_login_at', type: 'timestamp', nullable: true })
  lastLoginAt: Date | null
}
