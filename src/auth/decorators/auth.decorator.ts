import { ApiBearerAuth, ApiForbiddenResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';
import { Permissions } from '../../permission/permission.constant';
import { PermissionsGuard } from '../../permission/guards/permissions.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

export function Auth(...permissions: Permissions[]) {
  return applyDecorators(
    SetMetadata('permissions', permissions),
    UseGuards(JwtAuthGuard, PermissionsGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ApiForbiddenResponse({ description: 'Forbidden resource' }),
  );
}
