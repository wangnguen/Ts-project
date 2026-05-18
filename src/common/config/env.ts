import { z } from 'zod/v4'

const serverEnvSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(8080),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CLIENT_URL: z.url(),
  CLIENT_ORIGINS: z
    .string()
    .transform((val) =>
      val
        .split(',')
        .map((url) => url.trim())
        .filter(Boolean)
    )
    .refine(
      (urls) => urls.length > 0 && urls.every((url) => z.url().safeParse(url).success),
      'Each CLIENT_ORIGINS must be a valid URL'
    ),
  ENABLE_DOCS: z.stringbool().default(true)
})

const databaseEnvSchema = z.object({
  DATABASE_URL: z.url()
})

const authEnvSchema = z.object({
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
    .default(30 * 24 * 60 * 60)
})

const googleEnvSchema = z.object({
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GOOGLE_CALLBACK_URL: z.url().default('http://localhost:8080/api/v1/auth/google/callback')
})

const emailEnvSchema = z.object({
  EMAIL_PROVIDER: z.enum(['nodemailer', 'resend']).default('nodemailer'),
  MAIL_FROM: z.email().default('noreply@example.com'),
  SMTP_HOST: z.string().default('smtp.gmail.com'),
  SMTP_PORT: z.coerce.number().int().default(587),
  SMTP_USER: z.string().default(''),
  SMTP_PASS: z.string().default(''),
  RESEND_API_KEY: z.string().default('')
})

const appEnvSchema = z.object({
  APP_NAME: z.string().min(1).default('Ts Project'),
  VERIFY_EMAIL_EXPIRE_MINUTES: z.coerce.number().int().positive().default(10),
  RESET_PASSWORD_EXPIRE_MINUTES: z.coerce.number().int().positive().default(5)
})

const storageEnvSchema = z.object({
  STORAGE_DIR: z.string().min(1).default('uploads')
})

const dockerEnvSchema = z.object({
  DOCKERHUB_USERNAME: z.string().default('')
})

const envSchema = z.object({
  ...serverEnvSchema.shape,
  ...databaseEnvSchema.shape,
  ...authEnvSchema.shape,
  ...googleEnvSchema.shape,
  ...emailEnvSchema.shape,
  ...appEnvSchema.shape,
  ...dockerEnvSchema.shape,
  ...storageEnvSchema.shape
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
