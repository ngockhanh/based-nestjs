import {
  ObjectLiteral,
  EntityManager,
  EntityTarget,
  Repository,
  SelectQueryBuilder,
  DeepPartial,
} from 'typeorm';

export type SortDirection = 'ASC' | 'DESC';

export type Filters = { [key: string]: any };

export type Paginated<Entity> = {
  rows: Entity[],
  count: number,
};

type Page = {
  current?: number,
  limit?: number;
  noCount?: boolean,
};

type PageOption = {
  limit: number,
  offset: number,
  noCount: boolean,
};

type Sort = { [key: string]: SortDirection };

type ManyAndCountResult<Entity> = [rows: Entity[], count: number ];

export abstract class BaseRepository<Entity extends ObjectLiteral>
  extends Repository<Entity> {
  /**
   * Extending classes must have an alias.
   *
   * @protected
   * @abstract
   * @type {string}
   */
  protected abstract alias: string;

  /**
   * @private
   * @type {SelectQueryBuilder<Entity>}
   */
  private qb: SelectQueryBuilder<Entity>;

  /**
   * Set of ORDER BY queries for the
   * current query context
   *
   * @protected
   * @type {Sort}
   */
  protected sorts: Sort;

  /**
   * The object to be used for pagination.
   *
   * @protected
   * @type {Page}
   */
  protected page: Page;

  /** @overload */
  constructor(entity: EntityTarget<Entity>, entityManager: EntityManager) {
    super(entity, entityManager);

    this.qb = null;

    this.sorts = {};
    this.page = {};
  }

  /**
   * Set pagination.
   *
   * @param {number} [page=1]
   * @param {number} [limit=15]
   * @param {boolean} [noCount=false]
   *
   * @return {this}
   */
  setPage(page: number = 1, limit: number = 15, noCount: boolean = false): this {
    this.page = {
      current: page,
      limit,
      noCount,
    };

    return this;
  }

  /**
   * Add orderBy query to getters.
   *
   * @param {string} field
   * @param {SortDirection} [direction='ASC']
   *
   * @return {this}
   */

  sortBy(field: string, direction: SortDirection = 'ASC'): this {
    const [alias, sortField] = field.split('.');
    let sort = `${this.alias}.${field}`;

    if (alias && sortField) {
      sort = field;
    }

    this.sorts[sort] = direction as SortDirection;

    return this;
  }

  /**
   * Set orderBy query for getters.
   *
   * @param {Sort} sorts
   *
   * @return {this}
   */
  setSort(sorts: Sort = {}): this {
    if (typeof sorts === 'object') {
      this.sorts = sorts;
    }

    return this;
  }

  /**
   * Add id to current filters.
   *
   * @param {(number | string | Array<number | string>)} id
   *
   * @return {this}
   */
  filterById(id: number | string | Array<number | string>): this {
    const builder = this.builder();

    if (Array.isArray(id)) {
      builder.andWhere(`${this.alias}.id IN (:...id)`, { id });
    } else {
      builder.andWhere(`${this.alias}.id = :id`, { id });
    }

    return this;
  }

  /**
   * Include soft deleted records in the current query.
   *
   * @return {this}
   */
  withDeleted(): this {
    this
      .builder()
      .withDeleted();

    return this;
  }

  /**
   * Insert new entity record.
   *
   * @param {object} payload
   *
   * @return {Promise<Entity>}
   */
  async createNew(payload: object): Promise<Entity> {
    return this.save(super.create(payload as DeepPartial<Entity>));
  }

  /**
   * Insert bulk entities record.
   *
   * @param {object[]} payload
   *
   * @return {Promise<Entity[]>}
   */
  async bulkCreate(payload: object[]): Promise<Entity[]> {
    return this.save(super.create(payload as DeepPartial<Entity[]>));
  }

  /**
   * Generic getter for all.
   *
   * @param {string[]} [fields=[]]
   *
   * @return {(Promise<Paginated<Entity> | Entity[]>)}
   */
  async all(fields: string[] = []): Promise<Paginated<Entity> | Entity[]> {
    const pagination = this.getPageOpts();
    const builder = this
      .select(fields)
      .builder()
      .orderBy(this.sorts);

    if (pagination !== null) {
      builder
        .skip(pagination.offset)
        .take(pagination.limit);

      if (pagination.noCount === true) {
        return this.executeQuery(() => builder.getMany()) as Promise<Entity[]>;
      }

      const [rows, count] = await this.executeQuery(() => Promise.all([
        builder.getMany(),
        builder.getCount(),
      ])) as ManyAndCountResult<Entity>;

      return { rows, count };
    }

    return this.executeQuery(() => builder.getMany()) as Promise<Entity[]>;
  }

  /**
   * Arrange fields to select for the current query.
   *
   * @param {string[]} [fields=[]]
   *
   * @return {this}
   */
  select(fields: string[] = []): this {
    if (!fields || fields.length === 0) {
      return this;
    }

    const toSelect = [];

    for (let i = 0; i < fields.length; i += 1) {
      const field = fields[i];
      const [alias, selectField] = field.split('.');

      const withAlias = alias && selectField
        ? field
        : `${this.alias}.${field}`;

      toSelect.push(withAlias);
    }

    this.builder().select(toSelect);

    return this;
  }

  /**
   * Generic getter for raw records.
   *
   * @param {string[]} [fields=[]]
   *
   * @return {(Promise<Paginated<Entity> | Entity[]>)}
   */
  async allRaw<T>(fields: string[] = [])
    : Promise<(Paginated<Entity> | Entity[]) | (Paginated<T> | T[])> {
    const pagination = this.getPageOpts();
    const builder = this
      .select(fields)
      .builder()
      .orderBy(this.sorts);

    if (pagination !== null) {
      builder
        .offset(pagination.offset)
        .limit(pagination.limit);

      if (pagination.noCount === true) {
        return this.executeQuery(() => builder.getRawMany()) as Promise<Entity[]>;
      }

      const [rows, count] = await this.executeQuery(() => Promise.all([
        builder.getRawMany(),
        builder.getCount(),
      ])) as ManyAndCountResult<Entity>;

      return { rows, count };
    }

    return this.executeQuery(() => builder.getRawMany()) as Promise<Entity[]>;
  }

  /**
   * Generic getter for one Entity.
   *
   * @return {Promise<Entity>}
   */
  async first(): Promise<Entity> {
    const builder = this.builder();

    return this.executeQuery(() => builder.getOne()) as Promise<Entity>;
  }

  /**
   * Generic count query.
   *
   * @return {Promise<number>}
   */
  async count(): Promise<number> {
    const builder = this.builder();

    return this.executeQuery(() => builder.getCount()) as Promise<number>;
  }

  /**
   * Generic getter of record by id.
   *
   * @param {(number | string)} id
   *
   * @return {(Promise<Entity | null>)}
   */
  async getById(id: number | string): Promise<Entity | null> {
    return this.filterById(id).first();
  }

  /**
   * Generate raw sql with replaced escaped params.
   *
   * @param {(SelectQueryBuilder<any> | null)} currentBuilder
   *
   * @return {string}
   */
  rawSql(currentBuilder: SelectQueryBuilder<any> | null): string {
    const builder = currentBuilder || this.builder();
    const [rawSql, params] = builder.getQueryAndParameters();
    let sql = rawSql;

    params.forEach((value: any, index: number) => {
      if (typeof value === 'string') {
        sql = sql.replace(`$${index + 1}`, `'${value}'`);
      }
      if (typeof value === 'object') {
        if (Array.isArray(value)) {
          sql = sql.replace(
            `$${index + 1}`,
            value.map((el) => (typeof el === 'string' ? `'${el}'` : el)).join(','),
          );
        } else {
          sql = sql.replace(`$${index + 1}`, value);
        }
      }
      if (['number', 'boolean'].includes(typeof value)) {
        sql = sql.replace(`$${index + 1}`, value.toString());
      }
    });

    return sql;
  }

  /**
   * Get a query builder for the current repository instance.
   *
   * @protected
   * @return {SelectQueryBuilder<Entity>}
   */
  protected builder(): SelectQueryBuilder<Entity> {
    if (!this.qb) {
      this.qb = this.createQueryBuilder(this.alias);
    }

    return this.qb;
  }

  /**
   * Execute the given query builder method and reset
   * the repository instance to prepare for new query.
   *
   * @protected
   * @param {Function} query
   *
   * @return {(Promise<Entity | Entity[] | ManyAndCountResult<Entity>>)}
   */
  protected async executeQuery(query: Function)
    : Promise<Entity | Entity[] | ManyAndCountResult<Entity> | number> {
    this.resetRepository();

    return query();
  }

  /**
   * Reset all repository properties.
   *
   * @protected
   *
   * @return {this}
   */
  protected resetRepository(): this {
    this.qb = null;
    this.setSort({});
    this.setPage(null);

    return this;
  }

  /**
   * Get pagination options for query if available.
   *
   * @protected
   *
   * @return {PageOption|null}
   */
  protected getPageOpts(): PageOption | null {
    if (!this.page.current) {
      return null;
    }

    const { current, limit, noCount } = this.page;
    const offset = 0 + (current - 1) * limit;

    return { offset, limit, noCount };
  }

  /**
   * Get manager instance
   * @return {EntityManager}
   */
  getConnection(): EntityManager {
    return this.manager;
  }
}
