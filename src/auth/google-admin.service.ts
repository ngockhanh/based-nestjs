import { Injectable, Logger } from '@nestjs/common';
import { admin_directory_v1 } from 'googleapis';
import { MEMBER_FIELDS, USER_FIELDS } from '@/constants/google';

@Injectable()
export class GoogleAdminService {
  /**
   * @private
   * @type {Logger}
   */
  private logger: Logger;

  /**
   * Creates an instance of GoogleAdminService.
   *
   * @param {admin_directory_v1.Admin} directory
   */
  constructor(private readonly directory: admin_directory_v1.Admin) {
    this.logger = new Logger('GoogleAdminService');
  }

  /**
  * Get user data from google admin.
  *
  * @param {string} userKey email or id
  *
  * @return {(Promise<admin_directory_v1.Schema$User | null>)}
  */
  async getUser(userKey: string): Promise<admin_directory_v1.Schema$User | null> {
    try {
      const { data } = await this.directory.users.get({
        userKey,
        fields: USER_FIELDS.join(','),
      });

      return data;
    } catch (e) {
      this.logger.error(e);

      return null;
    }
  }

  /**
  * Get user data from google admin.
  *
  * @param {string} userKey email or id
  *
  * @return {(Promise<string | null>)}
  */
  async getPhoto(userKey: string): Promise<string | null> {
    const user = await this.getUser(userKey);

    if (!user) {
      return null;
    }

    return user.thumbnailPhotoUrl || null;
  }

  /**
   * Check if the user is active member of the provided group key.
   *
   * @param {string} memberKey email or id
   * @param {string} groupKey group id or name/email
   *
   * @return {Promise<boolean>}
   */
  async isActiveMember(memberKey: string, groupKey: string): Promise<boolean> {
    try {
      const { data } = await this.directory.members.get({
        groupKey,
        memberKey,
        fields: MEMBER_FIELDS.join(','),
      });

      if (!data || data.status !== 'ACTIVE') {
        this.logger.error(`${memberKey} is not active.`);

        return false;
      }

      return true;
    } catch (e) {
      this.logger.error(e);

      return false;
    }
  }
}
