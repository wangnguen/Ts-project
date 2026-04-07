import { Entity, Column } from 'typeorm'
import { BaseEntity } from './base.entity'
import { USER_ROLE, UserRole } from '@common/constants'
import { Exclude } from 'class-transformer'

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true, length: 30 })
  username: string

  @Exclude({ toPlainOnly: true })
  @Column({ select: false, length: 72 })
  password: string

  @Column({ unique: true, length: 255 })
  email: string

  @Column({ length: 255 })
  fullName: string

  @Column({ type: 'enum', enum: USER_ROLE, default: USER_ROLE.USER })
  role: UserRole

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt: Date | null
}
