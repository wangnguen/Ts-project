import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'
import env from '@common/config/env'
import { ErrorMiddleware, ResponseMiddleware } from '@common/middlewares'
import moduleRoutes from '@modules/index'
import { RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW_MS } from '@common/constants'

const app: express.Application = express()

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
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
    windowMs: RATE_LIMIT_WINDOW_MS,
    limit: RATE_LIMIT_MAX_REQUESTS,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' }
  })
)

app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true, limit: '1mb' }))
app.use(cookieParser())
app.use(ResponseMiddleware.extendResponse)

// Routes
app.use('/api/v1', moduleRoutes)

// 404 Handler
app.use(ErrorMiddleware.notFound)
// Global Error Handler
app.use(ErrorMiddleware.errorHandler)

export default app
