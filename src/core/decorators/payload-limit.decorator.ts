import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';
import { PayloadLimitGuard } from '../guard/payload-limit.guard';

export const PayloadLimit = (limit: number) => applyDecorators(
  UseGuards(PayloadLimitGuard),
  SetMetadata('limit', limit),
);
