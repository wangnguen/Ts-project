import { Monitor } from '@entities/monitor.entity'

export type CheckerResult = {
  status: 'up' | 'down'
  latency: number | null
  statusCode?: number
  message?: string
}

export interface CheckerStatus {
  checkStatus(monitor: Monitor): Promise<CheckerResult>
}
