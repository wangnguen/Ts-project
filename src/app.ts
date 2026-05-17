import path from 'node:path'

import express from 'express'
import swaggerUi from 'swagger-ui-express'

import { buildOpenAPIDocument } from '@docs/openapi'

import { applyAppMiddlewares, applySecurityMiddlewares } from '@common/config/app-middleware'
import env from '@common/config/env'
import { ErrorMiddleware } from '@common/middlewares'

import moduleRoutes from '@modules/index'

const app: express.Application = express()

applySecurityMiddlewares(app)

applyAppMiddlewares(app)

app.get('/', (_req, res) => res.redirect('/docs'))

app.use('/api/v1', moduleRoutes)

app.use('/uploads', express.static(path.resolve(env.STORAGE_DIR)))

if (env.ENABLE_DOCS) {
  const document = buildOpenAPIDocument()
  app.get('/docs/json', (_req, res) => res.json(document))
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(document, { swaggerOptions: { withCredentials: true } }))
}

app.use(ErrorMiddleware.notFound)

app.use(ErrorMiddleware.errorHandler)

export default app
