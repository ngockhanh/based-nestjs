import { EntityManager } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../core/base/base.repository';
import { Permission } from './permission.entity';

@Injectable()
export class PermissionRepository extends BaseRepository<Permission> {
  /**
   * @protected
   */
  protected readonly alias = 'permission';

  /**
   * Creates an instance of PermissionRepository.
   *
   * @param {EntityManager} entityManager
   */
  constructor(entityManager: EntityManager) {
    super(Permission, entityManager);
  }

  /**
   * Add name to current filters.
   *
   * @param {(string | string[])} name
   *
   * @return {this}
   */
  filterByName(name: string | string[]): this {
    const builder = this.builder();

    if (Array.isArray(name)) {
      builder.andWhere(`${this.alias}.name IN (:...name)`, { name });
    } else {
      builder.andWhere(`${this.alias}.name = :name`, { name });
    }

    return this;
  }
}
