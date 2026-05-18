import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'

import { MonitorStatus } from '@common/constants/monitor.constant'

import { BaseEntity } from '@entities/base.entity'
import { Monitor } from '@entities/monitor.entity'

@Entity('status_records')
class StatusRecord extends BaseEntity {
  @Column({ type: 'enum', enum: MonitorStatus })
  status: MonitorStatus

  @Column({ type: 'int', nullable: true })
  latency: number | null

  @Column({ type: 'int', nullable: true })
  statusCode: number | null

  @Column({ type: 'text', nullable: true })
  message: string | null

  @Column({ type: 'timestamp' })
  checkedAt: Date

  @ManyToOne(() => Monitor, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'monitor_id' })
  monitor: Monitor

  @Column({ type: 'uuid' })
  monitorId: string
}

export default StatusRecord
