import { z } from 'zod/v4'

const envSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(8080),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CLIENT_URL: z.url().default('http://localhost:3000'),
  DATABASE_URL: z.url(),
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  REFRESH_TOKEN_HASH_SECRET: z.string().min(32),
  AUTH_TOKEN_HASH_SECRET: z.string().min(32),
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
    .default(30 * 24 * 60 * 60),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GOOGLE_CALLBACK_URL: z.url().default('http://localhost:8080/api/v1/auth/google/callback'),
  RESEND_FROM: z.email().default('onboarding@resend.dev'),
  RESEND_API_KEY: z.string().min(1),
  RESEND_RECIPIENTS_EMAIL: z.email().default(''),
  RESEND_VERIFY_TEMPLATE_ID: z.string().min(1),
  RESEND_RESET_PASSWORD_TEMPLATE_ID: z.string().min(1),
  APP_NAME: z.string().min(1).default('Ts Project'),
  VERIFY_EMAIL_EXPIRE_MINUTES: z.coerce.number().int().positive().default(10),
  RESET_PASSWORD_EXPIRE_MINUTES: z.coerce.number().int().positive().default(5)
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
