import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  UsePipes,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BaseController } from '@/core/base/base.controller';
import { ValidationPipe } from '@/core/pipes/validation.pipe';
import { Auth } from '@/auth/decorators/auth.decorator';
import { ApiValidationErrorResponse } from '@/swagger/decorators';
import { ManagePermissionsDto } from './dto/manage-permissions.dto';
import { PermissionService } from './permission.service';
import { Permissions } from './permission.constant';
import { PermissionCategory } from './permission-category.entity';

@ApiTags('permissions')
@Controller('permissions')
export class PermissionController extends BaseController {
  /**
   * Creates an instance of PermissionController.
   *
   * @param {PermissionService} permissions
   */
  constructor(private permissions: PermissionService) {
    super();
  }

  @Get('/categories')
  @Auth(Permissions.VIEW_ROLE)
  async categories(): Promise<PermissionCategory[]> {
    return this.permissions.categories();
  }

  @Post('/manage')
  @HttpCode(200)
  @ApiValidationErrorResponse()
  @UsePipes(ValidationPipe)
  @Auth(Permissions.MANAGE_ROLE)
  async manage(@Body() body: ManagePermissionsDto) {
    await this.permissions.manage(body.data);

    return { success: true };
  }
}
