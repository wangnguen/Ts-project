import { randomBytes } from 'node:crypto'

import NodeCache from 'node-cache'

// WARNING: in-memory only — state is lost on restart and not shared across multiple instances.
// Replace with Redis when scaling to multiple server instances.
const STATE_TTL_SECONDS = 10 * 60

class AuthCacheService {
  private static cache: NodeCache = new NodeCache({
    stdTTL: STATE_TTL_SECONDS,
    checkperiod: 60,
    deleteOnExpire: true,
    useClones: false
  })

  static generateOAuthState(): string {
    const state = randomBytes(32).toString('hex')

    this.cache.set(this.getOAuthStateKey(state), true, STATE_TTL_SECONDS)

    return state
  }

  static consumeOAuthState(state: string): boolean {
    const key = this.getOAuthStateKey(state)

    const isValid = this.cache.get<boolean>(key) === true

    this.cache.del(key)

    return isValid
  }

  private static getOAuthStateKey(state: string): string {
    return `oauth:state:${state}`
  }
}

export default AuthCacheService
