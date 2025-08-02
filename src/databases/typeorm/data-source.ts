import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import * as path from 'path';


config();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [
    path.join(__dirname, '..', '..', '**', '*.entity{.ts,.js}'),
  ],
  migrations: [
    path.join(__dirname, 'migrations', '*{.ts,.js}'),
  ],
  subscribers: [
    path.join(__dirname, 'subscribers', '*.subscriber{.ts,.js}'),
  ],
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
};

const dataSource = new DataSource(dataSourceOptions);

dataSource
  .initialize()
  .then(() => {
    console.log('Data Source has been initialized!')
  })
  .catch((err) => {
    console.error('Error during Data Source initialization', err)
  })
export default dataSource;  