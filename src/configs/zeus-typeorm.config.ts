import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { addTransactionalDataSource, getDataSourceByName } from 'typeorm-transactional';
import { DataSource, DataSourceOptions } from 'typeorm';
import {
  boolean,
  isCI,
  isDev,
  isTest,
} from '@/core/core.helpers';
import { DatabaseLogger } from '@/core/logger/database.logger';
import { ZEUS_CONNECTION_NAME } from '@/constants/property';

export const getDbConfig = (configService: ConfigService) => {
  let name = configService.get('ZEUS_DB_NAME');
  const ssl = boolean(configService.get('ZEUS_DB_SSL'));

  if (isTest() && !isCI()) {
    name = `${name}_test`;
  }

  return <TypeOrmModuleOptions>{
    type: configService.get('ZEUS_DB_CONNECTION'),
    host: configService.get('ZEUS_DB_HOST'),
    port: +configService.get<number>('ZEUS_DB_PORT'),
    username: configService.get('ZEUS_DB_USERNAME'),
    password: configService.get('ZEUS_DB_PASSWORD'),
    database: name,
    entities: [],
    autoLoadEntities: true,
    ssl: ssl ? {
      rejectUnauthorized: false,
    } : false,
    namingStrategy: new SnakeNamingStrategy(),
    logging: boolean(configService.get('DEBUG')),
    logger: !isDev() ? new DatabaseLogger() : undefined,
    name: ZEUS_CONNECTION_NAME,
  };
};

export default {
  imports: [ConfigModule],
  name: ZEUS_CONNECTION_NAME,
  useFactory: getDbConfig,
  async dataSourceFactory(options: DataSourceOptions) {
    if (!options) {
      throw new Error('Invalid Zeus connection data source options passed');
    }

    const connection = getDataSourceByName(ZEUS_CONNECTION_NAME);

    if (connection) {
      return connection;
    }

    return addTransactionalDataSource({
      name: ZEUS_CONNECTION_NAME,
      dataSource: new DataSource(options),
    });
  },
  inject: [ConfigService],
};
