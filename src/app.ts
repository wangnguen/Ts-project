import express from 'express'
import swaggerUi from 'swagger-ui-express'

import { applyAppMiddlewares, applySecurityMiddlewares } from '@common/config/app-middleware'
import env from '@common/config/env'
import { buildOpenAPIDocument } from '@common/docs/openapi'
import { ErrorMiddleware } from '@common/middlewares'

import moduleRoutes from '@modules/index'

const app: express.Application = express()

applySecurityMiddlewares(app)

applyAppMiddlewares(app)

app.get('/', (_req, res) => res.redirect('/api/v1/docs'))

app.use('/api/v1', moduleRoutes)

if (env.ENABLE_DOCS) {
  const document = buildOpenAPIDocument()
  app.get('/api/v1/docs/json', (_req, res) => res.json(document))
  app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(document))
}

app.use(ErrorMiddleware.notFound)

app.use(ErrorMiddleware.errorHandler)

export default app
