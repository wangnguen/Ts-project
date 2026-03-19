import env from '@common/config/env'
import 'reflect-metadata'
import { User } from '@databases/entities/user.entity'
import { DataSource } from 'typeorm'

class AppDataSource {
  private static instance: DataSource

  private static getInstance(): DataSource {
    if (!AppDataSource.instance) {
      AppDataSource.instance = new DataSource({
        type: 'postgres',
        url: env.DATABASE_URL,
        ssl: env.NODE_ENV === 'development' ? { rejectUnauthorized: false } : { rejectUnauthorized: true },
        entities: [User],
        migrations: ['src/migrations/*.{ts,js}'],
        synchronize: env.NODE_ENV === 'development',
        logging: false
      })
    }

    return AppDataSource.instance
  }

  public static getDataSource(): DataSource {
    return AppDataSource.getInstance()
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
