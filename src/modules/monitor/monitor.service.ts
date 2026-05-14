import { CreateMonitorBody } from '@modules/monitor/dto'
import MonitorRepository from '@modules/monitor/monitor.repository'

class MonitorService {
  static createMonitor(dto: CreateMonitorBody, userId: string) {
    return MonitorRepository.createMonitor({ ...dto, userId })
  }
}

export default MonitorService
