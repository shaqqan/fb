import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as path from 'path';

export default registerAs('typeorm', (): TypeOrmModuleOptions => ({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [
    path.join(__dirname, '..', '..', 'databases', 'typeorm', 'entities', '*.entity{.ts,.js}'),
  ],
  migrations: [
    path.join(__dirname, '..', '..', 'databases', 'typeorm', 'migrations', '*{.ts,.js}'),
  ],
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
}));
