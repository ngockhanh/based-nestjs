import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  UsePipes,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BaseController } from '@/core/base/base.controller';
import { Paginated } from '@/core/base/base.repository';
import { ValidationPipe } from '@/core/pipes/validation.pipe';
import { Auth } from '@/auth/decorators/auth.decorator';
import { Permissions } from '@/permission/permission.constant';
import { PaginatedDto } from '@/core/dto/paginated.dto';
import { ApiPaginatedResponse, ApiValidationErrorResponse } from '@/swagger/decorators';
import { RoleService } from './role.service';
import { Role } from './role.entity';
import { CreateRoleDto, UpdateRoleDto } from './dto';

type ListFilters = {
  query: string,
  status: boolean,
  minLevel: number,
};

@ApiTags('roles')
@Controller('roles')
export class RoleController extends BaseController {
  /**
   * Creates an instance of RoleController.
   *
   * @param {RoleService} roles
   */
  constructor(private roles: RoleService) {
    super();
  }

  @Get('/')
  @ApiPaginatedResponse(Role)
  @Auth(Permissions.VIEW_ROLE)
  async index(@Req() request): Promise<PaginatedDto<Role>> {
    const opts = this.getListOpts(request);
    const data = await this.roles.all(opts) as Paginated<Role>;

    if (data.rows) {
      return this.listWithPagination(data, request);
    }

    return <PaginatedDto<Role>><unknown>data;
  }

  @Get('/:id')
  @Auth(Permissions.VIEW_ROLE)
  async show(@Param('id', ParseIntPipe) id: number): Promise<Role> {
    return this.getRoleRecord(id);
  }

  @Post('/')
  @ApiValidationErrorResponse()
  @UsePipes(ValidationPipe)
  @Auth(Permissions.MANAGE_ROLE)
  async store(@Body() body: CreateRoleDto): Promise<Role> {
    await this.validateRole(body.name, 'create_role_validation');

    const created = await this.roles.create({
      ...body,
      name: body.name.toLowerCase(),
    });

    return created;
  }

  @Put('/:id')
  @ApiValidationErrorResponse()
  @UsePipes(ValidationPipe)
  @Auth(Permissions.MANAGE_ROLE)
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateRoleDto) {
    const { name } = body;
    const errorCode = 'update_role_validation';
    const record = await this.getRoleRecord(id, errorCode);

    this.canModifyRole(record, errorCode);

    if (name && name !== record.name) {
      await this.validateRole(name, errorCode);
    }

    await this.roles.update(record, body);

    return { success: true };
  }

  @Delete('/:id')
  @ApiValidationErrorResponse()
  @Auth(Permissions.MANAGE_ROLE)
  async destroy(@Param('id', ParseIntPipe) id: number) {
    const errorCode = 'delete_role_validation';
    const record = await this.getRoleRecord(id, errorCode);

    this.canModifyRole(record, errorCode);

    await this.roles.delete(record);

    return { success: true };
  }

  /**
   * @inheritdoc
   * @override
   */
  protected getFilters(request: any): object {
    const { user } = request;
    const { query } = request.query;
    const filters = <ListFilters>{
      minLevel: user.role?.level ?? 1,
    };

    if (query) {
      filters.query = query as string;
    }

    return filters;
  }

  /**
   * Validate role can be modified.
   * Super admin role can not be modified.
   *
   * @private
   * @param {Role} record
   * @param {string} errorCode
   *
   * @return {*}
   * @throws {import('@/core/exceptions').ForbiddenException}
   */
  private canModifyRole(record: Role, errorCode: string): any {
    if (record.level === 0) {
      this.throwForbiddenException('Super admin role can not be modified', errorCode);
    }

    return true;
  }

  /**
   * Attempt to get a role record.
   *
   * @private
   * @param {number} id
   * @param {string} [errorCode='']
   *
   * @return {(Promise<Role | null>)}
   * @throws {BadRequestException}
   */
  private async getRoleRecord(id: number, errorCode: string = ''): Promise<Role | null> {
    const record = await this.roles.getById(id);

    if (errorCode && !record) {
      this.throwRoleNotFound(errorCode);
    }

    return record;
  }

  /**
   * Validate role name if it already exists.
   *
   * @private
   * @param {string} name
   * @param {string} errorCode
   *
   * @return {Promise<boolean>}
   * @throws {BadRequestException}
   */
  private async validateRole(name: string, errorCode: string): Promise<boolean> {
    const existing = await this.roles.getByName(name);

    if (existing) {
      this.throwBadRequestException(`Role with name ${name} already exists`, errorCode);
    }

    return true;
  }

  /**
   * Throw bad request error for not existing role record.
   *
   * @private
   * @param {string} code
   *
   * @throws {BadRequestException}
   */
  private throwRoleNotFound(code: string) {
    return this.throwBadRequestException('Role record does not exist', code);
  }
}
