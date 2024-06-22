FROM node:18-alpine AS builder

WORKDIR /home/node/app

COPY ./package.json yarn.lock ./

RUN yarn install \
  --prefer-offline \
  --frozen-lockfile \
  --non-interactive \
  --production=false

COPY . .
RUN yarn build

RUN rm -rf node_modules && \
  NOYARNPOSTINSTALL=1 NODE_ENV=production yarn install \
  --prefer-offline \
  --pure-lockfile \
  --non-interactive \
  --production=true

# Build production image
FROM node:18-alpine

LABEL maintainer="Tran Ngoc Khanh"

ENV UV_THREADPOOL_SIZE=100 \
  NODE_ENV=production \
  NPM_CONFIG_LOGLEVEL=error \
  WORK_DIR=/home/node/app \
  APP_PORT=3000 \
  APP_HOST=http://localhost:3000 \
  CLIENT_HOST= \
  DB_CONNECTION= \
  DB_USERNAME= \
  DB_PASSWORD= \
  DB_NAME= \
  DB_HOST= \
  DB_PORT= \
  DB_SSL= \
  GOOGLE_KEY_PATH= \
  GOOGLE_PROJECT_ID= \
  GOOGLE_AUTH_CLIENT_ID= \
  GOOGLE_AUTH_CLIENT_SECRET= \
  GOOGLE_AUTH_REDIRECT_URL= \
  GOOGLE_STORAGE_BUCKET= \
  SSO_ENTRYPOINT= \
  SSO_ISSUER= \
  SSO_CALLBACK_URL= \
  SSO_CERT= \
  SSO_SUCCESS_REDIRECT= \
  SSO_FAILURE_REDIRECT= \
  USER_GROUP_ID= \
  JWT_SECRET= \
  MAILCHIMP_API_KEY= \
  MAILCHIMP_ACCOUNT= \
  MAIL_SENDER= \
  EMAIL_DOMAINS= \
  REDIS_HOST= \
  REDIS_PORT= \
  REDIS_DB= \
  REDIS_PASSWORD= \
  REDIS_TIMEOUT= \
  CACHE_DRIVER= \
  CACHE_PREFIX=ipl_ \
  QUEUE_NAME= \
  QUEUE_DRIVER= \
  QUEUE_SUBSCRIPTION=

# Add dumb-init
ADD https://github.com/Yelp/dumb-init/releases/download/v1.2.5/dumb-init_1.2.5_x86_64 /usr/local/bin/dumb-init

WORKDIR ${WORK_DIR}

RUN mkdir ${WORK_DIR} -p && \
  chown -R node:node ${WORK_DIR}  /usr/local/ && \
  chmod 0755 ${WORK_DIR} -R && \
  chmod +x /usr/local/bin/dumb-init

USER node:node

COPY --from=builder ${WORK_DIR}/package.json  ./package.json
COPY --from=builder ${WORK_DIR}/node_modules  ./node_modules
COPY --from=builder ${WORK_DIR}/dist  ./dist

EXPOSE 3000


ENTRYPOINT ["/usr/local/bin/dumb-init"]

CMD [ "yarn", "start:prod" ]