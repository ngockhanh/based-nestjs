import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import {
  boolean,
  isCI,
  isDev,
  isTest,
} from '@/core/core.helpers';
import { DatabaseLogger } from '@/core/logger/database.logger';

export const getDbConfig = (configService: ConfigService) => {
  let name = configService.get('DB_NAME');
  const ssl = boolean(configService.get('DB_SSL'));

  if (isTest() && !isCI()) {
    name = `${name}_test`;
  }

  return <TypeOrmModuleOptions>{
    type: configService.get('DB_CONNECTION'),
    host: configService.get('DB_HOST'),
    port: +configService.get<number>('DB_PORT'),
    username: configService.get('DB_USERNAME'),
    password: configService.get('DB_PASSWORD'),
    database: name,
    entities: [],
    autoLoadEntities: true,
    ssl: ssl ? {
      rejectUnauthorized: false,
    } : false,
    namingStrategy: new SnakeNamingStrategy(),
    logging: boolean(configService.get('DEBUG')),
    logger: !isDev() ? new DatabaseLogger() : undefined,
  };
};

export default {
  imports: [ConfigModule],
  useFactory: getDbConfig,
  inject: [ConfigService],
};
