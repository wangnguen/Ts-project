export const MonitorType = {
  HTTP: 'http',
  HTTPS: 'https',
  TCP: 'tcp',
  PING: 'ping'
} as const

export type MonitorType = (typeof MonitorType)[keyof typeof MonitorType]

export const MonitorStatus = {
  UP: 'up',
  DOWN: 'down',
  PENDING: 'pending'
} as const

export type MonitorStatus = (typeof MonitorStatus)[keyof typeof MonitorStatus]
