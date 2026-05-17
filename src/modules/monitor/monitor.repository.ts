import { Monitor } from '@entities/monitor.entity'

import AppDataSource from '@databases/data-source'

class MonitorRepository {
  static findById(id: string) {
    return this.MonitorRepo.findOne({ where: { id } })
  }

  static findAllByUserId(userId: string, limit: number, offset: number) {
    return this.MonitorRepo.findAndCount({ where: { userId }, take: limit, skip: offset })
  }

  static createMonitor(monitor: Partial<Monitor>) {
    const newMonitor = this.MonitorRepo.create(monitor)
    return this.MonitorRepo.save(newMonitor)
  }

  static updateMonitor(id: string, data: Partial<Monitor>) {
    return this.MonitorRepo.update({ id }, data)
  }

  static softDeleteMonitor(id: string) {
    return this.MonitorRepo.softDelete({ id })
  }

  private static get MonitorRepo() {
    return AppDataSource.getDataSource().getRepository(Monitor)
  }
}

export default MonitorRepository
