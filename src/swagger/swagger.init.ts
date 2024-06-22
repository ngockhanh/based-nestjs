import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

/**
 * Initialize Swagger.
 *
 * @export
 * @param {string} uri
 * @param {INestApplication} app
 */
export function initSwagger(uri: string, app: INestApplication) {
  const swaggerOpts = new DocumentBuilder()
    .setTitle('Internal Portal API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerOpts);
  SwaggerModule.setup(uri, app, document);
}
