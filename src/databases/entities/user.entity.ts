import { Entity, Column } from 'typeorm'
import { BaseEntity } from './base.entity'

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user'
}

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true })
  username: string

  @Column({ select: false })
  password: string

  @Column({ unique: true })
  email: string

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole
}
