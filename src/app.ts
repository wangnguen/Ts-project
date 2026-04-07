import express from 'express'
import { applyAppMiddlewares, applySecurityMiddlewares } from '@common/config/app-middleware'
import { ErrorMiddleware } from '@common/middlewares'
import moduleRoutes from '@modules/index'

const app: express.Application = express()

applySecurityMiddlewares(app)

applyAppMiddlewares(app)

app.use('/api/v1', moduleRoutes)

app.use(ErrorMiddleware.notFound)

app.use(ErrorMiddleware.errorHandler)

export default app
