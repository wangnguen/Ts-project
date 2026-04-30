import { randomBytes } from 'node:crypto'

const STATE_TTL_MS = 10 * 60 * 1000

interface StateEntry {
  expiresAt: number
}

const store = new Map<string, StateEntry>()

export const generateOAuthState = (): string => {
  const state = randomBytes(32).toString('hex')
  store.set(state, { expiresAt: Date.now() + STATE_TTL_MS })
  return state
}

export const consumeOAuthState = (state: string): boolean => {
  const entry = store.get(state)
  store.delete(state)

  if (!entry) return false
  if (Date.now() > entry.expiresAt) return false

  return true
}
