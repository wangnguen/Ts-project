import 'dotenv/config'
import env from '@common/config/env'
import AppDataSource from '@databases/data-source'
import app from './app'

const bootstrap = async () => {
  await AppDataSource.connect()

  const server = app.listen(env.PORT, () => {
    console.log(`Server is running on port ${env.PORT}`)
  })

  process.on('SIGINT', () => {
    server.close(() => console.log(`Exit Server Express`))
  })
}

bootstrap().catch((err) => {
  console.error('Failed to start server', err.message)
  process.exit(1)
})
