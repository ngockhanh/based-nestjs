import { EntityManager } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../core/base/base.repository';
import { PermissionCategory } from './permission-category.entity';

@Injectable()
export class PermissionCategoryRepository extends BaseRepository<PermissionCategory> {
  /**
   * @protected
   */
  protected readonly alias = 'pc';

  /**
   * Creates an instance of PermissionCategoryRepository.
   *
   * @param {EntityManager} entityManager
   */
  constructor(entityManager: EntityManager) {
    super(PermissionCategory, entityManager);
  }

  /**
   * Include permissions to the current query.
   *
   * @return {this}
   */
  withPermissions(): this {
    this
      .builder()
      .leftJoinAndSelect(`${this.alias}.permissions`, 'permissions');

    return this;
  }
}
