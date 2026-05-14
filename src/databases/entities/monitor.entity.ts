import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'

import { MonitorStatus, MonitorType } from '@common/constants/monitor.constant'

import { BaseEntity } from '@entities/base.entity'
import { User } from '@entities/user.entity'

@Entity('monitors')
export class Monitor extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  name: string

  @Column({ type: 'enum', enum: MonitorType })
  type: MonitorType

  @Column({ type: 'text' })
  target: string

  @Column({ type: 'int', default: 60 })
  interval: number

  @Column({ type: 'int', default: 30 })
  timeout: number

  @Column({ type: 'int', default: 1 })
  retries: number

  @Column({ type: 'boolean', default: true })
  isActive: boolean

  @Column({ type: 'enum', enum: MonitorStatus, default: 'pending' })
  currentStatus: MonitorStatus

  @Column({ type: 'timestamp', nullable: true })
  lastCheckedAt: Date | null

  @Column({ type: 'simple-array', nullable: true })
  acceptedStatusCodes: number[]

  @Column({ type: 'text', nullable: true })
  keyword: string | null

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User

  @Column({ type: 'uuid' })
  userId: string
}
