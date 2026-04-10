import { DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config(); 

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432, // Default 5432
  username: process.env.DB_USERNAME || 'pro2020', // Default pro2020
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_DATABASE || 'mydb',
  entities: ['dist/**/*.entity{.ts,.js}'],
  synchronize: true, 
};