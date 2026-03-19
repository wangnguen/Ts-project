import 'reflect-metadata'
import { User } from 'src/databases/entities/user.entity.js'
import { DataSource } from 'typeorm'

class AppDataSource {
  private static instance: DataSource

  private static getInstance(): DataSource {
    if (!AppDataSource.instance) {
      AppDataSource.instance = new DataSource({
        type: 'postgres',
        url: process.env.DATABASE_URL,
        ssl: {
          rejectUnauthorized: false
        },
        entities: [User],
        migrations: ['src/migrations/*.{ts,js}'],
        synchronize: true,
        logging: false
      })
    }

    return AppDataSource.instance
  }

  public static async connect(): Promise<DataSource> {
    const dataSource = AppDataSource.getInstance()

    if (!dataSource.isInitialized) {
      await dataSource.initialize()
      console.log('Database connected')
    }

    return dataSource
  }
}

export default AppDataSource
