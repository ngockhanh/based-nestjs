import { Role } from '@/role/role.entity';
import { User } from '@/user/user.entity';
import { AuthUserData } from '../auth.interface';

export class AuthUserDto {
  /**
   * Creates an instance of AuthUserDto.
   *
   * @param {User} user
   */
  constructor(private readonly user: User) {}

  /**
   * Retrieve the tokenizable data of the user.
   *
   * @return {AuthUserData}
   */
  data(): AuthUserData {
    return {
      id: this.user.id,
      email: this.user.email,
      name: this.user.name,
      avatar: this.user.avatar,
      role: this.extractRole(),
      permissions: this.extractPermissions(),
      isSuperAdmin: this.user.isSuperAdmin,
      preferences: this.user.preferences,
      adminAppUserId: this.user.adminAppUserId,
    };
  }

  /**
   * Extract role from the user entity.
   *
   * @private
   *
   * @return {(Role | null)}
   */
  private extractRole(): Role | null {
    const role = this.getRole();

    if (role) {
      return <Role>{
        id: role.id,
        name: role.name,
        level: role.level,
      };
    }

    return null;
  }

  /**
   * Exrtact role permissions.
   *
   * @private
   *
   * @return {string[]}
   */
  private extractPermissions(): string[] {
    const role = this.getRole();

    if (!role || !role.permissions) {
      return [];
    }

    const { permissions } = role;
    const result = [];

    for (let i = 0; i < permissions.length; i += 1) {
      const { name } = permissions[i];

      result.push(name);
    }

    return result;
  }

  /**
   * Since the current Internal Portal (IP) only set
   * one role per user, we will get the first role
   * from the user record.
   *
   * This database structure is flexible if ever IP
   * requires multiple role per user in the future.
   *
   * @private
   * @return {(Role | null)}
   */
  private getRole(): Role | null {
    const { roles } = this.user;

    if (roles && roles.length > 0) {
      return roles[0];
    }

    return null;
  }
}
