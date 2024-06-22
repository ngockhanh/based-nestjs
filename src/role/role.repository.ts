import { Brackets, EntityManager } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../core/base/base.repository';
import { Role } from './role.entity';

@Injectable()
export class RoleRepository extends BaseRepository<Role> {
  /**
   * @protected
   */
  protected readonly alias = 'role';

  /**
   * Creates an instance of RoleRepository.
   *
   * @param {EntityManager} entityManager
   */
  constructor(entityManager: EntityManager) {
    super(Role, entityManager);
  }

  /**
   * Include permissions relation to current query.
   *
   * @return {this}
   */
  withPermissions(): this {
    this
      .builder()
      .leftJoinAndSelect(`${this.alias}.permissions`, 'permissions');

    return this;
  }

  /**
   * Add name or description to current filters.
   *
   * @param {string} query
   *
   * @return {this}
   */
  filterByQuery(query: string): this {
    this
      .builder()
      .andWhere(
        new Brackets((qb) => {
          qb.where(`${this.alias}.name ILIKE :name`, { name: `%${query}%` })
            .orWhere(`${this.alias}.description ILIKE :description`, { description: `%${query}%` });
        }),
      );

    return this;
  }

  /**
   * Add active status to current filters.
   *
   * @param {boolean} status
   *
   * @return {this}
   */
  filterByActive(status: boolean): this {
    this
      .builder()
      .andWhere(`${this.alias}.active = :status`, { status });

    return this;
  }

  /**
   * Add name to current filters.
   *
   * @param {string} name
   *
   * @return {this}
   */
  filterByName(name: string): this {
    this
      .builder()
      .andWhere(`${this.alias}.name = :name`, { name });

    return this;
  }

  /**
   * Add minimum level to current filters.
   *
   * @param {number} level
   *
   * @return {this}
   */
  filterByMinLevel(level: number): this {
    this
      .builder()
      .andWhere(`${this.alias}.level >= :level`, { level });

    return this;
  }
}
