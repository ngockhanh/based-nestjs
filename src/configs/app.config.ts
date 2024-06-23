import * as fs from 'node:fs';
import { NestApplicationOptions } from '@nestjs/common';
import { isDev } from '@/core/core.helpers';

export default () => {
  const { CLIENT_HOST, ORIGINS_WHITELIST } = process.env;
  const whitelistOrigins = ORIGINS_WHITELIST ? ORIGINS_WHITELIST.split('|') : [];
  const origins: Array<string | RegExp> = [CLIENT_HOST];

  whitelistOrigins.forEach((origin: string) => {
    if (origin.startsWith('/')) {
      origins.push(new RegExp(origin.replace(/^\/|\/$/g, '')));
    } else {
      origins.push(origin);
    }
  });

  const helmet = {
    contentSecurityPolicy: {
      useDefaults: false,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        objectSrc: ["'none'"],
        childSrc: ["'self'"],
        frameAncestors: ["'self'"],
        upgradeInsecureRequests: [],
        blockAllMixedContent: [],
      },
    },
  };

  const config = {
    port: process.env.APP_PORT,
    host: process.env.APP_HOST,
    version: process.env.npm_package_version,
    clientHost: CLIENT_HOST,
    whitelistOrigins: origins,
    appOptions: {},
    bodyParser: {
      maxLimit: 1000 * 1000 * 10, // 10mb
      defaultLimit: 1000 * 200, // 200kb
    },
    helmet,
  };

  if (isDev()) {
    (config.appOptions as NestApplicationOptions).httpsOptions = {
      key: fs.readFileSync(process.env.DEV_SERVER_KEY),
      cert: fs.readFileSync(process.env.DEV_SERVER_CERT),
    };
  }

  return config;
};
