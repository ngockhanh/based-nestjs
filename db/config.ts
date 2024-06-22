import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { getDbConfig } from '../src/configs/typeorm.config';

ConfigModule.forRoot();
const configService = new ConfigService();
const config = getDbConfig(configService);

export default new DataSource(<DataSourceOptions>{
  ...config,
  migrations: ['db/migrations/*.ts'],
  entities: ['src/**/*.entity.ts'],
  migrationsTableName: '_migrations',
});
