import 'dotenv/config'
import env from '@common/config/env.js'
import app from './app.js'

const server = app.listen(env.PORT, () => {
  console.log(`Server is running on port ${env.PORT}`)
})

process.on('SIGINT', () => {
  server.close(() => console.log(`Exit Server Express`))
})
