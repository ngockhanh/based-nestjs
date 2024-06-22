import { applyDecorators } from '@nestjs/common';
import { ApiBadRequestResponse } from '@nestjs/swagger';

export const ApiValidationErrorResponse = () => applyDecorators(
  ApiBadRequestResponse({
    schema: {
      type: 'object',
      properties: {
        error: {
          type: 'object',
          properties: {
            message: {
              oneOf: [
                { type: 'string' },
                { type: 'object' },
              ],
            },
            statusCode: { type: 'number' },
            code: { type: 'string' },
            stack: { type: 'string' },
          },
        },
      },
    },
  }),
);
