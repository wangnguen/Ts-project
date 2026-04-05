import { z } from 'zod/v4'

const envSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(8080),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CLIENT_URL: z.url().default('http://localhost:3000'),
  DATABASE_URL: z.url(),
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.coerce
    .number()
    .int()
    .positive()
    .default(15 * 60),
  JWT_REFRESH_EXPIRES_IN: z.coerce
    .number()
    .int()
    .positive()
    .default(7 * 24 * 60 * 60),
  MAX_SESSION_LIFETIME_IN: z.coerce
    .number()
    .int()
    .positive()
    .default(30 * 24 * 60 * 60)
})

export type EnvSchema = z.infer<typeof envSchema>

const validateEnv = (): EnvSchema => {
  const result = envSchema.safeParse(process.env)

  if (!result.success) {
    console.error('Invalid environment variables:')
    console.error(z.prettifyError(result.error))
    process.exit(1)
  }

  return result.data
}

const env: EnvSchema = validateEnv()

export default env
