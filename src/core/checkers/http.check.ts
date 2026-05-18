import axios from 'axios'

import { Monitor } from '@entities/monitor.entity'

import { CheckerResult, CheckerStatus } from './base.check'

class HttpChecker implements CheckerStatus {
  async checkStatus(monitor: Monitor): Promise<CheckerResult> {
    const start = Date.now()
    try {
      const response = await axios(monitor.target, {
        timeout: monitor.timeout * 1000,
        validateStatus: () => true
      })
      const latency = Date.now() - start

      const isStatusAccepted = monitor.acceptedStatusCodes?.length
        ? monitor.acceptedStatusCodes.includes(response.status)
        : response.status >= 200 && response.status < 300

      const isKeywordMatch = monitor.keyword
        ? typeof response.data === 'string' && response.data.includes(monitor.keyword)
        : true

      return {
        status: isStatusAccepted && isKeywordMatch ? 'up' : 'down',
        latency,
        statusCode: response.status
      }
    } catch (error) {
      return {
        status: 'down',
        latency: Date.now() - start,
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

export default HttpChecker
