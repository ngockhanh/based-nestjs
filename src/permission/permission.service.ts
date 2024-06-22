import { Injectable } from '@nestjs/common';
import { Role } from '../role/role.entity';
import { RoleRepository } from '../role/role.repository';
import { CacheService, TTL } from '../core/cache/cache.service';
import { ManagePermissionItemDto } from './dto/manage-permission-item.dto';
import { Permission } from './permission.entity';
import { PermissionCategory } from './permission-category.entity';
import { PermissionRepository } from './permission.repository';
import { PermissionCategoryRepository } from './permission-category.repository';

@Injectable()
export class PermissionService {
  /**
   * Creates an instance of PermissionService.
   *
   * @param {PermissionRepository} permissions
   * @param {PermissionCategoryRepository} permissions
   * @param {RoleRepository} roles
   * @param {CacheService} cache
   */
  constructor(
    private readonly permissions: PermissionRepository,
    private readonly permissionCategories: PermissionCategoryRepository,
    private readonly roles: RoleRepository,
    private readonly cache: CacheService,
  ) {}

  /**
   * Get the permission categories with eager loaded permissions.
   *
   * @return {Promise<PermissionCategory[]>}
   */
  async categories(): Promise<PermissionCategory[]> {
    const fn = async () => this.permissionCategories
      .withPermissions()
      .all() as Promise<PermissionCategory[]>;

    return this.cache.remember('permissions_categories', TTL.TWO_DAYS, fn);
  }

  /**
   * Add the valid permissions to valid roles.
   *
   * @param {ManagePermissionItemDto[]} data
   *
   * @return {Promise<boolean>}
   */
  async manage(data: ManagePermissionItemDto[]): Promise<boolean> {
    const group = this.groupPermissions(data);
    const ids = Object.keys(group);

    const saves = [];
    const validRoles = await this.roles
      .filterById(ids)
      .all() as Role[];

    for (let i = 0; i < validRoles.length; i += 1) {
      const role = validRoles[i];
      const permissions = group[role.id];

      if (permissions) {
        saves.push(this.savePermissions(role, permissions));
      }
    }

    await Promise.all(saves);

    return true;
  }

  /**
   * Save the valid permissions to the current role.
   *
   * @private
   * @param {Role} role
   * @param {number[] | stirng[]} permissions
   *
   * @return {Promise<Role>}
   */
  private async savePermissions(role: Role, permissions: number[] | string[]): Promise<Role> {
    const repo = this.permissions;

    let newPermissions = [];

    if (permissions.length) {
      if (typeof permissions[0] === 'string') {
        repo.filterByName(permissions as string[]);
      } else {
        repo.filterById(permissions);
      }

      newPermissions = await repo.all() as Permission[];
    }

    // eslint-disable-next-line no-param-reassign
    role.permissions = newPermissions;

    return this.roles.save(role);
  }

  /**
   * Group permissions in an object with role id as the key.
   *
   * @private
   * @param {ManagePermissionItemDto[]} data
   *
   * @return {{ [id: string]: number[] }}
   */
  private groupPermissions(data: ManagePermissionItemDto[]): { [id: string]: number[] } {
    const group = {};

    for (let i = 0; i < data.length; i += 1) {
      const { roleId, permissions } = data[i];

      group[roleId] = permissions;
    }

    return group;
  }
}
