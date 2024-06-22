import { Injectable } from '@nestjs/common';
import { Filters, Paginated, SortDirection } from '@/core/base/base.repository';
import { Role } from './role.entity';
import { RoleRepository } from './role.repository';
import { CreateRoleDto } from './dto/create-role.dto';

type ListOptions = {
  filters?: Filters,
  page?: {
    current: number,
    size: number
  },
  sort?: Array<string>
};

@Injectable()
export class RoleService {
  /**
   * Creates an instance of RoleService.
   *
   * @param {RoleRepository} roles
   */
  constructor(private readonly roles: RoleRepository) {}

  /**
   * Get all role records.
   *
   * @param {ListOptions} [opts={}]
   *
   * @returns {Promise<array>}
   */
  all(opts: ListOptions = {}): Promise<Role[] | Paginated<Role>> {
    return this.repository(opts)
      .withPermissions()
      .all();
  }

  /**
   * Get an instance of workable repository with applied
   * pagination, sort, and filters.
   *
   * @private
   * @param {ListOptions} [opts={}]
   *
   * @return {RoleRepository}
   */
  private repository(opts: ListOptions = {}): RoleRepository {
    const { page, filters, sort } = opts;
    const repo = this.roles;

    if (page) {
      const { current, size } = page;

      repo.setPage(current, size);
    }

    if (filters && filters.query) {
      repo.filterByQuery(filters.query as string);
    }

    if (filters && filters.minLevel) {
      repo.filterByMinLevel(filters.minLevel);
    }

    if (sort && sort.length > 0) {
      const field = sort[0];
      const direction = sort[1] ? sort[1] : null;

      repo.sortBy(field, direction as SortDirection);
    }

    return repo;
  }

  /**
   * Create a role record.
   *
   * @param {CreateRoleDto} payload
   *
   * @return {Promise<Role>}
   */
  async create(payload: CreateRoleDto): Promise<Role> {
    return this.roles.createNew(payload);
  }

  /**
   * Get a role record by id.
   *
   * @param {number} id
   *
   * @return {Promise<Role | null>}
   */
  async getById(id: number): Promise<Role | null> {
    return this.roles.getById(id);
  }

  /**
   * Get a role record by name
   *
   * @param {string} name
   *
   * @return {Promise<Role | null>}
   */
  async getByName(name: string): Promise<Role | null> {
    return this.roles
      .filterByName(name)
      .first();
  }

  /**
   * Update an existing role record with new data.
   *
   * @param {Role} record
   * @param {object} [newData={}]
   *
   * @returns {Promise<boolean>}
   */
  async update(record: Role, newData: object = {}): Promise<boolean> {
    await this.roles.update(record.id, newData);

    return true;
  }

  /**
   * Deletes a role record.
   *
   * @param {Role} record
   *
   * @returns {Promise<boolean>}
   */
  async delete(record: Role): Promise<boolean> {
    await this.roles.delete(record.id);

    return true;
  }
}
