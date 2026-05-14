import { Monitor } from '@entities/monitor.entity'

import AppDataSource from '@databases/data-source'

class MonitorRepository {
  static createMonitor(monitor: Partial<Monitor>) {
    const newMonitor = this.MonitorRepo.create(monitor)
    return this.MonitorRepo.save(newMonitor)
  }

  private static get MonitorRepo() {
    return AppDataSource.getDataSource().getRepository(Monitor)
  }
}

export default MonitorRepository
