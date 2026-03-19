import express, { Request, Response } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import env from '@common/config/env.js'
import ErrorMiddleware from '@common/middlewares/error.middleware.js'
import ResponseMiddleware from '@common/middlewares/response.middleware.js'
import AppDataSource from 'src/databases/data-source.js'

const app: express.Application = express()

app.disable('x-powered-by')

app.use(
  cors({
    origin: env.CLIENT_URL,
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['X-Request-Id']
  })
)

app.use(
  helmet(
    env.NODE_ENV === 'production'
      ? {}
      : {
          contentSecurityPolicy: {
            directives: {
              'upgrade-insecure-requests': null
            }
          }
        }
  )
)

app.use(compression())

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' }
  })
)

app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true, limit: '1mb' }))
app.use(ResponseMiddleware.extendResponse)

AppDataSource.connect().catch((err) => {
  console.log(`Connect to db error: ${err}`)
  process.exit(0)
})

// Routes
app.get('/health', (req: Request, res: Response) => {
  res.json({ ok: true })
})

// 404 Handler
app.use(ErrorMiddleware.notFound)
// Global Error Handler
app.use(ErrorMiddleware.errorHandler)

export default app
